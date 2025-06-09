package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	Id        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255)" json:"name"`
	Price     int64     `gorm:"type:int" json:"price"`
	Image     string    `gorm:"type:varchar(255)" json:"image"`
	UserId    uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserId"` // Menyatakan relasi dengan model User
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ProductResponse struct {
	Id        string      `json:"id"`
	Name      string      `json:"name"`
	Price     int64       `json:"price"`
	Image     string      `json:"image"`
	User      UserMinimal `json:"user"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserMinimal struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

func (u *Product) BeforeCreate(tx *gorm.DB) (err error) {
	u.Id = uuid.New()
	return
}
