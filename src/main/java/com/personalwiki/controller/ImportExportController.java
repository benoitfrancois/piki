package com.personalwiki.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.personalwiki.dto.ImportCheckDTO;
import com.personalwiki.dto.PageExportDTO;
import com.personalwiki.dto.PageRequestDTO;
import com.personalwiki.model.Page;
import com.personalwiki.model.Type;
import com.personalwiki.repository.PageRepository;
import com.personalwiki.repository.TypeRepository;
import com.personalwiki.service.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/import-export")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ImportExportController {

    private final PageService pageService;
    private final PageRepository pageRepository;
    private final TypeRepository typeRepository;

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .enable(SerializationFeature.INDENT_OUTPUT);

    // ── CHECK DUPLICATES ──────────────────────────────────────────────────────

    @PostMapping("/check-duplicates")
    public ResponseEntity<List<String>> checkDuplicates(@RequestBody ImportCheckDTO dto) {
        List<String> existing = new ArrayList<>();
        for (String title : dto.getTitles()) {
            if (pageRepository.findByTitleContainingIgnoreCase(title)
                    .stream().anyMatch(p -> p.getTitle().equalsIgnoreCase(title))) {
                existing.add(title);
            }
        }
        return ResponseEntity.ok(existing);
    }

    // ── EXPORT ────────────────────────────────────────────────────────────────

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportPages(@RequestBody List<Long> pageIds) throws IOException {
        List<Page> pages = new ArrayList<>();
        for (Long id : pageIds) {
            pageService.getPageById(id).ifPresent(pages::add);
        }

        List<PageExportDTO> dtos = pages.stream().map(PageExportDTO::from).toList();
        byte[] jsonBytes = mapper.writeValueAsBytes(dtos);

        // Build ZIP
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {

            // Add pages.json
            ZipEntry jsonEntry = new ZipEntry("pages.json");
            zos.putNextEntry(jsonEntry);
            zos.write(jsonBytes);
            zos.closeEntry();

            // Add images referenced in page content
            String uploadDir = "./data/uploads/";
            for (Page page : pages) {
                if (page.getContent() == null) continue;
                // Extract image filenames from markdown: ![...](/uploads/filename.ext)
                java.util.regex.Pattern pattern = java.util.regex.Pattern
                        .compile("\\(/uploads/([^)]+)\\)");
                java.util.regex.Matcher matcher = pattern.matcher(page.getContent());
                while (matcher.find()) {
                    String filename = matcher.group(1);
                    Path imagePath = Paths.get(uploadDir + filename);
                    if (Files.exists(imagePath)) {
                        ZipEntry imgEntry = new ZipEntry("images/" + filename);
                        zos.putNextEntry(imgEntry);
                        zos.write(Files.readAllBytes(imagePath));
                        zos.closeEntry();
                    }
                }
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"piki-export.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(baos.toByteArray());
    }

    // ── IMPORT ────────────────────────────────────────────────────────────────

    @PostMapping("/import")
    public ResponseEntity<?> importPages(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
            @RequestParam(value = "selectedTitles", required = false) List<String> selectedTitles
    ) {
        try {
            String filename = file.getOriginalFilename() != null
                    ? file.getOriginalFilename().toLowerCase() : "";

            List<PageExportDTO> dtos;

            if (filename.endsWith(".zip")) {
                dtos = parseZip(file);
            } else if (filename.endsWith(".json")) {
                String json = new String(file.getBytes(), StandardCharsets.UTF_8);
                dtos = parseJson(json);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Unsupported file format. Use .zip or .json"));
            }

            // Filter by selected titles if provided
            if (selectedTitles != null && !selectedTitles.isEmpty()) {
                dtos = dtos.stream()
                        .filter(d -> selectedTitles.contains(d.getTitle()))
                        .toList();
            }

            int imported = 0;
            int skipped  = 0;
            int overwritten = 0;

            for (PageExportDTO dto : dtos) {
                boolean exists = pageRepository.findByTitleContainingIgnoreCase(dto.getTitle())
                        .stream().anyMatch(p -> p.getTitle().equalsIgnoreCase(dto.getTitle()));

                if (exists && !overwrite) {
                    skipped++;
                    continue;
                }

                if (exists && overwrite) {
                    // Delete existing then recreate
                    pageRepository.findByTitleContainingIgnoreCase(dto.getTitle())
                            .stream()
                            .filter(p -> p.getTitle().equalsIgnoreCase(dto.getTitle()))
                            .findFirst()
                            .ifPresent(p -> pageService.deletePage(p.getId()));
                    overwritten++;
                }

                pageService.createPage(toRequest(dto));
                imported++;
            }

            return ResponseEntity.ok(Map.of(
                    "imported", imported,
                    "skipped", skipped,
                    "overwritten", overwritten,
                    "message", imported + " imported, " + skipped + " skipped, " + overwritten + " overwritten"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────

    private List<PageExportDTO> parseZip(MultipartFile file) throws Exception {
        String uploadDir = "./data/uploads/";
        Files.createDirectories(Paths.get(uploadDir));
        List<PageExportDTO> dtos = new ArrayList<>();

        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                byte[] bytes = zis.readAllBytes();

                if (name.equals("pages.json")) {
                    dtos = parseJson(new String(bytes, StandardCharsets.UTF_8));
                } else if (name.startsWith("images/")) {
                    // Restore image to uploads folder
                    String imgFilename = name.substring("images/".length());
                    if (!imgFilename.isEmpty()) {
                        Files.write(Paths.get(uploadDir + imgFilename), bytes);
                    }
                }
                zis.closeEntry();
            }
        }
        return dtos;
    }

    private List<PageExportDTO> parseJson(String json) throws Exception {
        if (json.trim().startsWith("[")) {
            return mapper.readValue(json, mapper.getTypeFactory()
                    .constructCollectionType(List.class, PageExportDTO.class));
        } else {
            return List.of(mapper.readValue(json, PageExportDTO.class));
        }
    }

    private PageRequestDTO toRequest(PageExportDTO dto) {
        PageRequestDTO req = new PageRequestDTO();
        req.setTitle(dto.getTitle());
        req.setContent(dto.getContent());
        req.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());

        // Match type by name
        if (dto.getTypeName() != null) {
            Type type = typeRepository.findByNameIgnoreCase(dto.getTypeName())
                    .orElseGet(() -> {
                        Type newType = new Type();
                        newType.setName(dto.getTypeName());
                        newType.setColor(dto.getTypeColor() != null ? dto.getTypeColor() : "gray");
                        newType.setIcon(dto.getTypeIcon() != null ? dto.getTypeIcon() : "📄");
                        return typeRepository.save(newType);
                    });
            req.setType(type);
        }

        return req;
    }
}
