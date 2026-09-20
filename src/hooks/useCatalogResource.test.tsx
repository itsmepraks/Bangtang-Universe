import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogResource } from './useCatalogResource';

let root: Root;
let host: HTMLDivElement;
const payload = (title: string) => new Response(JSON.stringify({
  table: 'media', count: 1, rows: [{ id: 1, title }],
}), { status: 200 });

function Harness({ enabled = true }: { enabled?: boolean }) {
  const { data, loading, error, refetch } = useCatalogResource('media', enabled);
  return <><output>{loading ? 'Loading' : data.map(row => row.title).join(', ')}</output>
    {error && <p role="status">Saved data</p>}
    <button onClick={() => void refetch()}>Retry</button></>;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubEnv('VITE_CATALOG_API_URL', 'https://catalog.example/api/catalog');
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount()); host.remove();
  vi.unstubAllEnvs(); vi.unstubAllGlobals();
});

describe('Cloudflare catalog integration', () => {
  it('defers optional catalog reads until their section opens and retains the loaded data', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => payload('Run BTS'));
    vi.stubGlobal('fetch', fetchMock);
    await act(async () => root.render(<Harness enabled={false} />));
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => root.render(<Harness enabled />));
    expect(host.querySelector('output')?.textContent).toBe('Run BTS');
    await act(async () => root.render(<Harness enabled={false} />));
    await act(async () => root.render(<Harness enabled />));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shows the saved catalog after a Worker outage and replaces it when retry succeeds', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('Worker unavailable'))
      .mockResolvedValueOnce(payload('Saved show'))
      .mockResolvedValueOnce(payload('Live show'));
    vi.stubGlobal('fetch', fetchMock);
    await act(async () => root.render(<Harness />));
    expect(host.querySelector('output')?.textContent).toBe('Saved show');
    expect(host.querySelector('[role="status"]')?.textContent).toBe('Saved data');
    expect(fetchMock.mock.calls[1][0]).toBe('/data/catalog/media.json');
    await act(async () => host.querySelector('button')!.click());
    expect(host.querySelector('output')?.textContent).toBe('Live show');
    expect(host.querySelector('[role="status"]')).toBeNull();
  });
});
