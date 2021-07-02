// config.js
turnConfig = {
    iceServers: [
        {
        urls: ["stun:us-turn4.xirsys.com"]
        },
        {
            username: "WKdKaXxQv1Z-ip2BtCX5xgK0pKfWv2xNHpxxQcIjNnwq4zq_HJnZ2QbPvIZsaZl_AAAAAGCZwDRzcGluZTAwMQ==",
            credential: "961ce438-b1e6-11eb-b8e3-0242ac140004",
            urls: [
                "turn:us-turn4.xirsys.com:80?transport=udp", 
                "turn:us-turn4.xirsys.com:3478?transport=udp",
                "turn:us-turn4.xirsys.com:80?transport=tcp",
                "turn:us-turn4.xirsys.com:3478?transport=tcp",
                "turns:us-turn4.xirsys.com:443?transport=tcp",
                "turns:us-turn4.xirsys.com:5349?transport=tcp"
            ]
        }
    ]
}