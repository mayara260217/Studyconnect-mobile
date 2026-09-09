// URL base do backend studyconnect
// Para dev local: IP da máquina na rede (não use localhost em dispositivo físico)
// Para produção: URL do Render
export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';
