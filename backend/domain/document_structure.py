from pydantic import BaseModel

##構造として出力してほしいスキーマのモデル
class DocumentStructure(BaseModel):
    content: str
    keywords: list[str]
    is_contain_image: bool