package com.personalwiki.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    // Redirect all non-API routes to Angular's index file
    @GetMapping(value = {"/", "/dashboard", "/pages", "/pages/**", "/admin", "/import-export"})
    public String index() {
        return "forward:/index.csr.html";
    }
}
