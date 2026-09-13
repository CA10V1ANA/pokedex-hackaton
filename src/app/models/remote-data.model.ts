/**
 * RemoteData — modelo genérico para representar o estado de qualquer dado remoto.
 *
 * Em vez de três signals separados (isLoading, error, data), usamos um único
 * objeto com um discriminante 'status' para representar todos os estados
 * de forma mutuamente exclusiva e type-safe.
 *
 * Uso:
 *   const state: RemoteData<Pokemon[]> = { status: 'loading' };
 *   const state: RemoteData<Pokemon[]> = { status: 'success', data: [...] };
 *   const state: RemoteData<Pokemon[]> = { status: 'error', message: 'Falha na rede' };
 */
export type RemoteData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

// Funções utilitárias para criar estados sem errar o formato
export const idle = (): RemoteData<never> => ({ status: 'idle' });
export const loading = (): RemoteData<never> => ({ status: 'loading' });
export const success = <T>(data: T): RemoteData<T> => ({ status: 'success', data });
export const failure = (message: string): RemoteData<never> => ({ status: 'error', message });
