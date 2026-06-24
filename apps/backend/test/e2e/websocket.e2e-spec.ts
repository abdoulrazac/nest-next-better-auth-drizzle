import { describe, it, expect } from 'vitest';
import { WsHandlerRegistry } from '../../src/websocket/ws-handler.registry';

describe('WsHandlerRegistry', () => {
  it('registers and retrieves a handler', () => {
    const registry = new WsHandlerRegistry();
    const handler = () => {};
    registry.register('join', handler);
    expect(registry.getHandler('join')).toBe(handler);
  });

  it('returns undefined for unregistered event', () => {
    const registry = new WsHandlerRegistry();
    expect(registry.getHandler('nope')).toBeUndefined();
  });

  it('throws on duplicate registration', () => {
    const registry = new WsHandlerRegistry();
    registry.register('join', () => {});
    expect(() => registry.register('join', () => {})).toThrow(
      'Handler already registered for event: join',
    );
  });
});
