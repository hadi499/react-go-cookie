package database

import (
	"fmt"
	"log"

	// "server-cookie/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Ganti dengan kredensial database yang sesuai
	dsn := "root:admin123@tcp(127.0.0.1:3306)/gocookie_db?charset=utf8mb4&parseTime=True&loc=Local"

	// Membuka koneksi ke database dengan konfigurasi logger aktif
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("❌ Gagal terhubung ke database:", err)
	}

	// Migrasi otomatis (pastikan model sudah benar)
	// err = DB.AutoMigrate(&models.Product{}, &models.User{})
	// if err != nil {
	// 	log.Fatal("❌ Gagal melakukan migrasi database:", err)
	// }

	fmt.Println("✅ Database connected successfully!")
}

// GetDB mengembalikan instance database
func GetDB() *gorm.DB {
	if DB == nil {
		log.Fatal("❌ Database belum diinisialisasi. Panggil ConnectDatabase() terlebih dahulu.")
	}
	return DB
}
