import sys
import json
import re

def get_agung_reply(user_msg: str) -> str:
    text = user_msg.lower().strip()

    # Sapaan
    if re.search(r'\b(halo|hai|hei|oy|pagi|siang|sore|malam|p|assalamualaikum|yo|bro|cuy)\b', text):
        return (
            "Halo bro! Kenalin, gw **Agung**.\n\n"
            "Ada yang mau lu tanyain atau diobrolin seputar gw, kuliah Sistem Informasi di UNPAM, hobi game, atau coding? Santai aja bro, gas!"
        )

    # Profil umum / Siapa kamu?
    if re.search(r'\b(siapa|profil|biodata|tentang|diri|kenalan|info|nama)\b', text):
        return (
            "Yo bro! Kenalin lengkap profil gw nih:\n\n"
            "* **Nama**: Agung\n"
            "* **Umur**: 19 tahun\n"
            "* **Asal**: Sumedang, Jawa Barat (terkenal sama tahu Sumedang yang gurih renyah!)\n"
            "* **Kampus**: Universitas Pamulang (UNPAM), baru masuk **Semester 1** jurusan **Sistem Informasi**\n"
            "* **Cita-cita**: Menjadi **Programmer** / Software Engineer handal\n"
            "* **Lagu Favorit**: *The Shape of My Heart* - Backstreet Boys\n"
            "* **Hobi Game**: Roblox, A Space for the Unbound, dan Punishing: Gray Raven (PGR)\n\n"
            "Biasanya kalau lagi penat habis nugas atau pulang kuliah, gw suka santai main game atau dengerin lagunya Backstreet Boys. Salam kenal ya bro!"
        )

    # Asal Sumedang
    if re.search(r'\b(sumedang|asal|tinggal|daerah|tahu|jawa barat)\b', text):
        return (
            "Gw asli dari **Sumedang, Jawa Barat** bro!\n\n"
            "* **Kuliner Khas**: Pasti yang pertama kepikiran Tahu Sumedang kan? Beneran enak apalagi yang anget dicocol cabe rawit ijo.\n"
            "* **Suasana**: Daerahnya sejuk, asik, dan tenang banget buat nongkrong atau santai sehabis kuliah."
        )

    # Umur
    if re.search(r'\b(umur|usia|tahun)\b', text):
        return "Gw sekarang umur **19 tahun** bro, lagi di fase adaptasi seru jadi mahasiswa baru semester 1!"

    # Kampus / UNPAM / Semester 1 / Jurusan Sistem Informasi
    if re.search(r'\b(unpam|pamulang|kuliah|kampus|semester|maba|jurusan|sistem informasi)\b', text):
        return (
            "Gw kuliah di **UNPAM (Universitas Pamulang)**, sekarang baru masuk **Semester 1** jurusan **Sistem Informasi**!\n\n"
            "* Seru banget belajar perpaduan antara teknologi informasi, manajemen sistem, dan dasar-dasar pemrograman.\n"
            "* Sekarang lagi adaptasi sama tugas-tugas kuliah dan kenalan sama temen-temen baru."
        )

    # Cita-cita / Programmer
    if re.search(r'\b(cita|cita-cita|programmer|ngoding|coding|developer|software|code|program|tujuan|mimpi)\b', text):
        return (
            "Cita-cita gw pengen jadi **Programmer / Software Engineer** handal bro!\n\n"
            "* **Alasan**: Gw suka banget proses problem solving dan bikin aplikasi yang berguna dari baris-baris kode.\n"
            "* **Aktivitas**: Di waktu luang, gw suka ngulik Python dan dasar-dasar pemrograman web."
        )

    # Lagu kesukaan: The Shape of My Heart - Backstreet Boys
    if re.search(r'\b(lagu|musik|music|song|shape of my heart|backstreet boys|bsb|playlist|dengerin)\b', text):
        return (
            "Lagu nomor satu di playlist gw itu **\"The Shape of My Heart\" dari Backstreet Boys**!\n\n"
            "* **Vibes**: Pop ballad klasik yang melodinya adem dan vokalnya harmonis banget.\n"
            "* **Kapan Diputer**: Enak banget didengerin pas lagi penat habis nugas atau pas baru pulang kuliah buat refreshing pikiran."
        )

    # Game & Hobi (penat habis nugas/pulang kuliah)
    if re.search(r'\b(game|gaming|main|hobi|roblox|space for the unbound|pgr|punishing|hiburan|penat|capek)\b', text):
        return (
            "Kalo lagi penat habis nugas atau sehabis pulang kuliah, ini game favorit yang biasa gw mainin bro:\n\n"
            "1. **Roblox**: Seru-seruan mabar bareng temen tongkrongan, nyobain bermacam game unik kreasi komunitas.\n"
            "2. **A Space for the Unbound**: Game indie lokal buatan Indonesia berlatar SMA era 90-an. Ceritanya deep dan pixel art-nya juara.\n"
            "3. **Punishing: Gray Raven (PGR)**: Action RPG sci-fi cyberpunk dengan combat 3-ping cepat yang satisfying banget.\n\n"
            "Lu sendiri suka main game apa nih bro?"
        )

    # Python
    if re.search(r'\b(python|py|bahasa pemrograman)\b', text):
        return (
            "Gw seneng ngulik **Python** di waktu luang bro!\n\n"
            "* Sintaksnya bersih dan gampang dipahami anak semester 1 kayak gw.\n"
            "* Ekosistemnya luas banget buat bikin skrip, bot, atau program sederhana."
        )

    # Default respon santai terstruktur
    return (
        f"Asik juga pertanyaannya bro!\n\n"
        "Sebagai **Agung** (19 tahun dari **Sumedang**, maba **UNPAM Semester 1** jurusan **Sistem Informasi** yang cita-citanya jadi programmer), "
        "gw selalu seneng diajak ngobrol santai gini.\n\n"
        "Ada yang mau lu tanyain lagi seputar kuliah di UNPAM, game favorit, atau lagu *The Shape of My Heart* Backstreet Boys?"
    )

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "halo"
    reply = get_agung_reply(query)
    print(json.dumps({
        "reply": reply,
        "author": "Agung",
        "engine": "Python 3.10 Engine"
    }, ensure_ascii=False))
