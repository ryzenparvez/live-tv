# Jashodal Internet TV — GitHub Pages Setup

এই সংস্করণটি static hosting-এর জন্য সাজানো। GitHub Pages PHP চালায় না, তাই আগের `resolve.php` বাদ দেওয়া হয়েছে। BDIX SERVER-1-এর token/embed resolver GitHub Pages-এ কাজ করবে না; কোনো third-party session/token restriction পাশ কাটানোর resolver এখানে রাখা হয়নি।

## GitHub Pages-এ প্রকাশ

1. GitHub-এ একটি **Public** repository তৈরি করুন, যেমন `jashodal-internet-tv`।
2. এই ZIP-এর ভেতরের সব ফাইল ও ফোল্ডার repository-র root-এ upload করুন। `index.html` অবশ্যই root-এ থাকবে।
3. Repository → **Settings → Pages** খুলুন।
4. **Deploy from a branch** নির্বাচন করুন। Branch `main`, folder `/(root)` দিয়ে Save করুন।
5. Deploy শেষ হলে `https://YOUR-USERNAME.github.io/jashodal-internet-tv/` ঠিকানায় সাইট খুলুন।

## স্ট্রিম যোগ / পরিবর্তন

- **নিজস্ব / অনুমোদিত স্ট্রিম:** `assets/js/channels.js` ফাইলের `window.CH` array-তে চ্যানেল যোগ করুন। প্রতিটি row-এর কাঠামো: `["নাম", "ক্যাটাগরি", "unique-id", "https://.../index.m3u8", "logo-url"]`।
- **Provider Streams:** `assets/js/channels-s2.js`-এর `window.CH_S2` তালিকা ব্যবহার হয়। প্রকাশের আগে প্রতিটি URL-এর সম্প্রচার/পুনঃপ্রচার অনুমতি নিশ্চিত করুন; অনুমতি না থাকা চ্যানেল মুছে দিন।
- HLS URL যতটা সম্ভব HTTPS হতে হবে। HTTPS পেজে HTTP স্ট্রিম ব্রাউজার mixed-content হিসেবে ব্লক করতে পারে।
- স্ট্রিম হোস্টকে browser playback/CORS অনুমতি দিতে হবে। শুধু `.m3u8` URL হলেই সব ব্রাউজারে চলবে—এমন নয়। কিছু স্ট্রিম geo-block, referer restriction, token expiry বা DRM ব্যবহার করতে পারে।
- `assets/js/config.js`-এ `defaultServer` বদলে ডিফল্ট তালিকা নির্বাচন করুন।

## সীমাবদ্ধতা

- GitHub Pages কেবল static HTML/CSS/JS host করে; PHP, server-side proxy, secret key বা token refresh চালায় না।
- যদি আপনার নিজের/অনুমোদিত provider API-তে private key, token refresh বা server-side authorization লাগে, সেটি আলাদা backend-এ চালাতে হবে। Secret কখনো GitHub repository-তে রাখবেন না।
- `assets/vendor/hls.min.js` না থাকলে পেজ CDN থেকে hls.js লোড করার চেষ্টা করে; তাই প্রথমবার playback-এর জন্য internet দরকার।
- ZIP-এ থাকা channel URLs-এর বর্তমান availability বা licensing এই প্যাকেজ দিয়ে যাচাই করা হয়নি। কেবল নিজের বা লিখিত অনুমতিপ্রাপ্ত স্ট্রিম প্রকাশ করুন।
