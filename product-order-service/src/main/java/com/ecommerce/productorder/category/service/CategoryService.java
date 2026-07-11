package com.ecommerce.productorder.category.service;

import com.ecommerce.productorder.category.dto.CategoryResponse;
import com.ecommerce.productorder.category.repository.CategoryRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository){

        this.repository=repository;
    }

    public List<CategoryResponse> getMainCategories(){

        return repository.getLevelOneCategories();
    }

    public List<CategoryResponse> getChildren(
            String parent){

        return repository.getChildCategories(parent);
    }

}