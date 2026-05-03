package com.taskflow.controller;

public abstract class BaseController {
    protected record ApiResponse(String message) {}
    protected record ErrorResponse(String error) {}
}