const PostalMime = require("postal-mime");

export default {
  async email(message, env, ctx) {
    // Forward email jika alamat tujuan diatur
    if (env.FORWARD_TO_ADDRESS) {
      await message.forward(env.FORWARD_TO_ADDRESS);
    }

    // 1. Parsing email mentah
    let rawEmail = new Response(message.raw);
    let arrayBuffer = await rawEmail.arrayBuffer();
    const parser = new PostalMime.default();
    const email = await parser.parse(arrayBuffer);

    // 2. Siapkan data untuk dikirim (objek email apa adanya)
    const payload = JSON.stringify(email);

    // 3. Kirim ke URL webhook kustom Anda
    let webhookResponse = await fetch(env.CUSTOM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    // 4. (Opsional) Cek jika pengiriman ke webhook gagal
    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.log(
        `Custom Webhook Failed: Response: ${webhookResponse.status} ${webhookResponse.statusText} -> ${errorText}`
      );
    }
  },
};
