package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	_ "github.com/lib/pq"
)

type Ucapan struct {
	ID        int    `json:"id,omitempty"`
	Nama      string `json:"nama"`
	Pesan     string `json:"pesan"`
	CreatedAt string `json:"created_at,omitempty"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// Setup CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	db, err := sql.Open("postgres", os.Getenv("SUPABASE_DB_URL"))
	if err != nil {
		http.Error(w, "Koneksi DB Gagal: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	if r.Method == "GET" {
		rows, err := db.Query("SELECT nama, pesan, created_at FROM ucapan ORDER BY created_at DESC")
		if err != nil {
			http.Error(w, "Gagal query data: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var list []Ucapan
		for rows.Next() {
			var u Ucapan
			if err := rows.Scan(&u.Nama, &u.Pesan, &u.CreatedAt); err != nil {
				continue
			}
			list = append(list, u)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(list)
	}

	if r.Method == "POST" {
		var u Ucapan
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, "Format JSON salah: "+err.Error(), http.StatusBadRequest)
			return
		}

		// Sanitasi: trim whitespace di awal & akhir
		// Karakter lain (emoji, dll) dibiarkan — tamu boleh nulis emoticon
		u.Nama = strings.TrimSpace(u.Nama)
		u.Pesan = strings.TrimSpace(u.Pesan)

		// Validasi tidak boleh kosong setelah trim
		if u.Nama == "" {
			http.Error(w, "Nama tidak boleh kosong", http.StatusBadRequest)
			return
		}
		if u.Pesan == "" {
			http.Error(w, "Pesan tidak boleh kosong", http.StatusBadRequest)
			return
		}

		_, err := db.Exec("INSERT INTO ucapan (nama, pesan) VALUES ($1, $2)", u.Nama, u.Pesan)
		if err != nil {
			http.Error(w, "Gagal simpan ke database: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		fmt.Fprintf(w, "Pesan sukses mendarat!")
	}
}
