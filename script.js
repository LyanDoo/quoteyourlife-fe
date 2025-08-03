document.addEventListener('DOMContentLoaded', () => {
    // --- KONFIGURASI & PEMILIHAN ELEMEN ---
    const API_URL = 'http://localhost:3000/quotes'; // ⚠️ GANTI DENGAN URL API ANDA

    // Elemen Modal & Form
    const addQuoteBtn = document.getElementById('add-quote-btn');
    const modal = document.getElementById('quote-modal');
    const closeModalBtns = modal.querySelectorAll('.delete, .modal-background, #cancel-btn');
    const saveQuoteBtn = document.getElementById('save-quote-btn');
    const quoteForm = document.getElementById('quote-form');
    const quoteInput = document.getElementById('quote-input');
    const authorInput = document.getElementById('author-input');

    // Elemen Kontainer
    const quotesContainer = document.getElementById('quotes-container');

    // --- FUNGSI-FUNGSI UTAMA ---

    /**
     * 📝 Membuat dan menampilkan satu sticky note di halaman.
     * @param {string} id - ID unik dari quote (dari database).
     * @param {string} quote - Isi dari quote.
     * @param {string} author - Penulis quote.
     */
    function createStickyNote(id, quote, author) {
        const column = document.createElement('div');
        column.className = 'column is-one-third-desktop is-half-tablet';
        column.dataset.id = id; // Simpan ID di elemen untuk referensi (misal: untuk hapus)

        // Variasi warna & rotasi acak
        const colors = ['note-yellow', 'note-pink', 'note-blue', 'note-green'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomRotation = Math.random() * 6 - 3; // Rotasi dari -3 s/d +3 derajat

        // Membuat HTML untuk sticky note
        column.innerHTML = `
            <div class="box sticky-note ${randomColor}" style="transform: rotate(${randomRotation}deg);">
                <button class="delete is-pulled-right delete-quote-btn" aria-label="delete"></button>
                <p class="content">"${quote}"</p>
                <footer class="author">- ${author || 'Anonymous'}</footer>
            </div>
        `;

        quotesContainer.prepend(column); // `prepend` agar quote baru selalu di atas
    }


    /**
     * 🌎 Memuat semua quotes dari REST API dan menampilkannya.
     */
    async function loadQuotes() {
        quotesContainer.innerHTML = '<p class="has-text-centered">Memuat quotes...</p>';
        try {
            const response = await fetch(API_URL);
            console.log(response)
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);
            
            const quotes = await response.json();
            console.log(quotes)
            quotesContainer.innerHTML = ''; // Kosongkan kontainer sebelum menampilkan data baru
            
            if (quotes.length === 0) {
                 quotesContainer.innerHTML = '<p class="has-text-centered">Can I quote you on that?</p>';
            } else {
                // Asumsi API mengembalikan array of objects: [{id, quote, author}]
                quotes.forEach(q => createStickyNote(q.id, q.text, q.author));
            }
        } catch (error) {
            console.error("Gagal memuat quotes:", error);
            quotesContainer.innerHTML = '<p class="has-text-centered has-text-danger">Try again later, yessss</p>';
        }
    }


    // --- FUNGSI MODAL ---
    const openModal = () => modal.classList.add('is-active');
    const closeModal = () => {
        modal.classList.remove('is-active');
        quoteForm.reset(); // Bersihkan form saat modal ditutup
    }

    // --- EVENT LISTENERS ---

    // 1. Tombol untuk membuka form modal
    addQuoteBtn.addEventListener('click', openModal);

    // 2. Tombol-tombol untuk menutup form modal
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    // 3. Tombol "Simpan" untuk mengirim quote baru ke API
    saveQuoteBtn.addEventListener('click', async () => {
        const quoteText = quoteInput.value.trim();
        const authorText = authorInput.value.trim();

        if (!quoteText) {
            alert("Quote can't be empty!");
            return;
        }

        const newQuote = { text: quoteText, author: authorText };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuote)
            });

            if (!response.ok) throw new Error('Server Error');

            const savedQuote = await response.json(); // Ambil quote yang baru disimpan (dengan ID-nya)
            createStickyNote(savedQuote.id, savedQuote.text, savedQuote.author); // Langsung tampilkan tanpa reload
            closeModal();

        } catch (error) {
            console.error("Server error:", error);
            alert("Server error");
        }
    });

    // 4. Tombol "Hapus" pada setiap sticky note (menggunakan event delegation)
    quotesContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-quote-btn')) {
            const noteElement = event.target.closest('.column');
            const quoteId = noteElement.dataset.id;

            if (confirm("U sure?")) {
                try {
                    const response = await fetch(`${API_URL}/${quoteId}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Failed, im sorry :"');

                    noteElement.remove(); // Hapus elemen dari tampilan jika berhasil
                    
                } catch (error) {
                    console.error(error);
                    alert("Failed, im sorry :')");
                }
            }
        }
    });

    // --- INISIALISASI ---
    loadQuotes(); // Muat semua data dari API saat halaman pertama kali dibuka
});