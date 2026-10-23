/** Logger tunggal: seluruh keluaran server melalui sini sehingga mudah diganti (mis. ke format JSON) atau dibungkam. */
export const logger = {
  info: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
};
