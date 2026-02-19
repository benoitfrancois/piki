package com.personalwiki.dto;

import com.personalwiki.model.Type;
import lombok.Data;

import java.util.List;

@Data
public class PageRequestDTO {
    private String title;
    private String content;
    private Type type;
    private List<String> tags;
}
