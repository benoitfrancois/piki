package com.personalwiki.dto;

import com.personalwiki.model.Page;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class PageExportDTO {
    private String title;
    private String content;
    private String typeName;
    private String typeColor;
    private String typeIcon;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PageExportDTO from(Page page) {
        PageExportDTO dto = new PageExportDTO();
        dto.setTitle(page.getTitle());
        dto.setContent(page.getContent());
        if (page.getType() != null) {
            dto.setTypeName(page.getType().getName());
            dto.setTypeColor(page.getType().getColor());
            dto.setTypeIcon(page.getType().getIcon());
        }
        dto.setTags(page.getTags().stream()
                .map(t -> t.getName())
                .collect(Collectors.toList()));
        dto.setCreatedAt(page.getCreatedAt());
        dto.setUpdatedAt(page.getUpdatedAt());
        return dto;
    }
}
