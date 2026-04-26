from pydantic import BaseModel, Field
from typing import List, Optional


class Access(BaseModel):
    employees: List[str] = Field(default_factory=list)
    teams: List[str] = Field(default_factory=list)
    depts: List[str] = Field(default_factory=list)
    roles: List[str] = Field(default_factory=list)


class Document(BaseModel):
    name: str
    url: str
    access: Access


class UserDetails(BaseModel):
    id: str
    orgId: str
    role: str
    teamId: str
    deptId: str


class IngestPayload(BaseModel):
    user_details: UserDetails
    documents: List[Document]


class QueryPayload(BaseModel):
    user_details: UserDetails
    question: str
