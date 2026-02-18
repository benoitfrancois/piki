package com.personalwiki.dto;

import com.personalwiki.model.Type;
import lombok.Data;
import java.util.Set;

@Data
public class PageRequestDTO {
    private String title;
    private String content;
    private Type type;
    private Set<String> tags;
}
