/* Jashodal Internet TV — GitHub Pages configuration */
window.SITE = {
  name: "Jashodal Internet",
  servers: [
    // নিজের / অনুমোদিত স্ট্রিম: assets/js/channels.js (window.CH) সম্পাদনা করুন।
    { id: "own", name: "নিজস্ব / অনুমোদিত", type: "hls", data: "CH" },
    // Provider playlist: assets/js/channels-s2.js (window.CH_S2) থেকে লোড হয়।
    // প্রকাশের আগে প্রতিটি স্ট্রিম ব্যবহারের অনুমতি যাচাই করুন।
    { id: "provider", name: "Provider Streams", type: "hls", data: "CH_S2" }
  ],
  defaultServer: "own",
  // CH তালিকায় URL না থাকলে নিজের HTTPS HLS pattern বসাতে পারেন।
  streamPattern: "",
  mobileApp: "",
  tvApp: ""
};
