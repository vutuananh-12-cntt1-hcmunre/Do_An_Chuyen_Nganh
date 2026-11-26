package com.example.restaurant_management.dto;
import java.util.List;
public class LoginResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private List<String> roles;
    private String token;
    private String tokenType;

    public Integer getUserId(){
        return userId;
    }
    public void setUserId(Integer userId){
        this.userId=userId;
    }
    public String getUsername(){
        return username;
    }
    public void setUsername(String username){
        this.username=username;
    }
    public String getFullName(){
        return fullName;
    }
    public void setFullName(String fullName){
        this.fullName=fullName;
    }
    public List<String> getRoles(){
        return roles;
    }
    public void setRoles(List<String> roles){
        this.roles=roles;
    }
    public String getToken(){
        return token;
    }
    public void setToken(String token){
        this.token=token;
    }
    public String getTokenType(){
        return tokenType;
    }
    public void setTokenType(String tokenType){
        this.tokenType=tokenType;
    }
}
