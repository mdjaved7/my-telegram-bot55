import os
import sqlite3
from flask import Flask, render_template, request, jsonify
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
import threading

# ===== APNI DETAILS YAHAN DALEIN =====
BOT_TOKEN = "8808145635:AAF80QiStQSIVQoTKvc-rDSRH1gf_VQ0Mgw"
ADMIN_CHAT_ID = "6598432032"
# =====================================

app = Flask(__name__, template_folder='templates', static_folder='static')
bot = telebot.TeleBot(BOT_TOKEN)

# Database Setup
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    # Stories Table
    c.execute('''CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY, title TEXT, price TEXT, image_url TEXT, access_link TEXT)''')
    # Settings Table (For QR Code)
    c.execute('''CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)''')
    # Default QR insert if not exists
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('qr_code', 'https://via.placeholder.com/200?text=Default+QR')")
    conn.commit()
    conn.close()

init_db()

# ================= BOT HANDLERS =================
@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    web_app_btn = InlineKeyboardButton("📱 Open All Story FM", web_app=telebot.types.WebAppInfo("https://aapka-domain.ngrok-free.app"))
    markup.add(web_app_btn)
    bot.send_message(message.chat.id, "Welcome to All Story FM! Premium stories sunne ke liye app open karein:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: True)
def handle_verification(call):
    data = call.data.split('|')
    action, user_id, story_id = data[0], data[1], data[2]

    if action == "verify":
        # Get story access link from DB
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute("SELECT title, access_link FROM stories WHERE id=?", (story_id,))
        story = c.fetchone()
        conn.close()

        if story:
            bot.send_message(user_id, f"🎉 **Payment Verified!**\n\nAapki story '{story[0]}' unlock ho gayi hai.\n🔗 Yahan se sunein/dekhein: {story[1]}")
            bot.edit_message_caption(caption=f"✅ Verified! Story sent to user {user_id}.", chat_id=call.message.chat.id, message_id=call.message.message_id)
    
    elif action == "reject":
        bot.send_message(user_id, "❌ Aapka payment reject ho gaya hai. Kripya sahi screenshot upload karein.")
        bot.edit_message_caption(caption="❌ Payment Rejected.", chat_id=call.message.chat.id, message_id=call.message.message_id)


# ================= WEB ROUTES (APIs & UI) =================

@app.route('/')
def user_app():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT * FROM stories")
    stories = [{"id": r[0], "title": r[1], "price": r[2], "image": r[3]} for r in c.fetchall()]
    c.execute("SELECT value FROM settings WHERE key='qr_code'")
    qr_code = c.fetchone()[0]
    conn.close()
    return render_template('index.html', stories=stories, qr_code=qr_code)

@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

@app.route('/api/add_story', methods=['POST'])
def add_story():
    title = request.form.get('title')
    price = request.form.get('price')
    image_url = request.form.get('image_url')
    access_link = request.form.get('access_link')

    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("INSERT INTO stories (title, price, image_url, access_link) VALUES (?, ?, ?, ?)", (title, price, image_url, access_link))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "Story added successfully!"})

@app.route('/api/update_qr', methods=['POST'])
def update_qr():
    qr_url = request.form.get('qr_url')
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("UPDATE settings SET value=? WHERE key='qr_code'", (qr_url,))
    conn.commit()
    conn.close()
    return jsonify({"status": "success", "message": "QR Code updated!"})

@app.route('/api/upload_payment', methods=['POST'])
def upload_payment():
    file = request.files.get('screenshot')
    user_id = request.form.get('user_id')
    story_id = request.form.get('story_id')
    story_title = request.form.get('story_title')
    price = request.form.get('price')

    if not file or file.filename == '':
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    filepath = f"temp_{file.filename}"
    file.save(filepath)

    with open(filepath, 'rb') as photo:
        markup = InlineKeyboardMarkup()
        btn_verify = InlineKeyboardButton("✅ Verify & Send Story", callback_data=f"verify|{user_id}|{story_id}")
        btn_reject = InlineKeyboardButton("❌ Reject", callback_data=f"reject|{user_id}|{story_id}")
        markup.add(btn_verify, btn_reject)

        caption = f"🚨 **New Order** 🚨\n\nUser ID: `{user_id}`\nStory: {story_title}\nPrice: ₹{price}\n\nVerify karte hi user ko link chala jayega."
        bot.send_photo(ADMIN_CHAT_ID, photo, caption=caption, reply_markup=markup, parse_mode="Markdown")

    os.remove(filepath)
    return jsonify({"status": "success", "message": "Admin ko screenshot bhej diya gaya hai!"})

def run_bot():
    bot.polling(none_stop=True)

if __name__ == '__main__':
    threading.Thread(target=run_bot).start()
    app.run(host='0.0.0.0', port=5000)
