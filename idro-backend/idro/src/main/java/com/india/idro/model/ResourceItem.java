package com.india.idro.model;

public class ResourceItem {
    private String name;
    private boolean available;
    private int quantity;

    public ResourceItem() {
        this.available = false;
        this.quantity = 0;
    }

    public ResourceItem(boolean available, int quantity) {
        this.available = available;
        this.quantity = quantity;
    }

    public ResourceItem(String name, boolean available, int quantity) {
        this.name = name;
        this.available = available;
        this.quantity = quantity;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
