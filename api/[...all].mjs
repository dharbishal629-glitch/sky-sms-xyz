import handler from "../artifacts/api-server/dist-vercel/handler.mjs";

export const config = {
  maxDuration: 60,
};

export default handler;
