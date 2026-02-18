package com.personalwiki.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Type {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    // Colour Tailwind ex: "blue", "green", "purple", "red", "orange", "gray"
    @Column(nullable = false, length = 30)
    private String color = "gray";

    // Emoji or short text ex: "📖", "🗂️", "🔄"
    @Column(length = 10)
    private String icon = "📄";

    public Type(String name, String color, String icon) {
        this.name = name;
        this.color = color;
        this.icon = icon;
    }
}
