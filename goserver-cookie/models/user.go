package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	Id        uuid.UUID `gorm:"type:char(36);primaryKey" json:"id"`
	Username  string    `gorm:"type:varchar(100)" json:"username"`
	Email     string    `gorm:"type:varchar(100)" json:"email" validate:"required,email"`
	Password  string    `gorm:"type:varchar(255)" json:"password" validate:"required,min=6"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Fungsi BeforeCreate untuk menghasilkan UUID sebelum penyimpanan ke database
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.Id = uuid.New()
	return
}
