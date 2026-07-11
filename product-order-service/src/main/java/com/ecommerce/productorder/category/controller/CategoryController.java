package com.ecommerce.productorder.category.controller;

import com.ecommerce.productorder.category.dto.CategoryResponse;
import com.ecommerce.productorder.category.service.CategoryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@CrossOrigin
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service){

        this.service=service;
    }

    @GetMapping("/level1")
    public List<CategoryResponse> levelOne(){

        return service.getMainCategories();
    }

    @GetMapping("/children/{parentCode}")
    public List<CategoryResponse> children(

            @PathVariable String parentCode){

        return service.getChildren(parentCode);
    }

}