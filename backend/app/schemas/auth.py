from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    distributor_name: str
    billing_email: EmailStr
    admin_name: str
    admin_email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
