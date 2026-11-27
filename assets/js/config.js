/* ===== Jashodal Internet: এই ফাইলে সার্ভারের তথ্য বসান ===== */
window.SITE = {
  name: "Jashodal Internet",
  // সার্ভারের তালিকা। সাইটে ক্যাটাগরির ওপরে এই নামে বাটন আসবে।
  servers: [
    // BDIX SERVER-1 (SM_All_TV.m3u): প্রতিটা চ্যানেলের নিজস্ব স্ট্রিম লিংক আছে (channels-s1.js), সরাসরি HLS প্লেয়ারে চলে
    { id: "s1",  name: "BDIX SERVER-1",   type: "hls",    data: "CH_S1" },
    // BDIX SERVER-2: প্লেলিস্টের প্রতিটা চ্যানেলের নিজস্ব স্ট্রিম লিংক আছে (channels-s2.js), সরাসরি HLS প্লেয়ারে চলে
    { id: "s2",  name: "BDIX SERVER-2",   type: "hls",    data: "CH_S2" },
    // TVServer-1 থেকে TVServer-5: আপনার দেওয়া ৫টা প্লেলিস্ট ফাইল থেকে, প্রতিটা সরাসরি HLS প্লেয়ারে চলে
    { id: "t1", name: "TVServer-1", type: "hls", data: "CH_T1" },
    { id: "t2", name: "TVServer-2", type: "hls", data: "CH_T2" },
    { id: "t3", name: "TVServer-3", type: "hls", data: "CH_T3" },
    { id: "t4", name: "TVServer-4", type: "hls", data: "CH_T4" },
    { id: "t5", name: "TVServer-5", type: "hls", data: "CH_T5" },
    // BDIX SERVER-OWN: আপনার নিজের স্ট্রিম লিংক (channels.js), সরাসরি HLS প্লেয়ারে চলে
    // চাইলে যেকোনো সার্ভারে  playlistUrl: "http://.../playlist.m3u"  যোগ করুন, তখন চ্যানেল ওই প্লেলিস্ট থেকে আসবে
    { id: "own", name: "BDIX SERVER-OWN", type: "hls",    data: "CH" }
  ],
  defaultServer: "s2",
  // SERVER-OWN এর জন্য: {slug} বসানো প্যাটার্ন (যেসব চ্যানেলে নিজস্ব URL নেই তাদের জন্য)
  streamPattern: "http://YOUR-SERVER-IP:PORT/live/{slug}/index.m3u8",
  mobileApp: "",
  tvApp: ""
};
