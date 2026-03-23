"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_bus_1 = require("../../events/event-bus");
const thought_fragment_events_1 = require("../../../domain/events/thought-fragment-events");
const test_data_generator_1 = require("../../../__test__/test-data-generator");
describe('EventSystem Integration Tests', () => {
    let eventBus;
    beforeEach(() => {
        eventBus = new event_bus_1.InMemoryEventBus();
    });
    test('should publish and subscribe to events', async () => {
        const thoughtFragment = test_data_generator_1.TestDataGenerator.generateThoughtFragment();
        const event = new thought_fragment_events_1.ThoughtFragmentCreatedEvent(thoughtFragment.id, 'test-user-id', thoughtFragment.content);
        const receivedEvents = [];
        const handler = {
            handle: (e) => {
                receivedEvents.push(e);
                return Promise.resolve();
            }
        };
        eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
        await eventBus.publish(event);
        expect(receivedEvents.length).toBe(1);
        expect(receivedEvents[0]).toBeInstanceOf(thought_fragment_events_1.ThoughtFragmentCreatedEvent);
        expect(receivedEvents[0].aggregateId).toBe(event.aggregateId);
        expect(receivedEvents[0].userId).toBe(event.userId);
        expect(receivedEvents[0].content).toBe(event.content);
    });
    test('should support multiple subscribers for the same event', async () => {
        const thoughtFragment = test_data_generator_1.TestDataGenerator.generateThoughtFragment();
        const event = new thought_fragment_events_1.ThoughtFragmentCreatedEvent(thoughtFragment.id, 'test-user-id', thoughtFragment.content);
        const receivedEvents1 = [];
        const receivedEvents2 = [];
        const handler1 = {
            handle: (e) => {
                receivedEvents1.push(e);
                return Promise.resolve();
            }
        };
        const handler2 = {
            handle: (e) => {
                receivedEvents2.push(e);
                return Promise.resolve();
            }
        };
        eventBus.subscribe('ThoughtFragmentCreatedEvent', handler1);
        eventBus.subscribe('ThoughtFragmentCreatedEvent', handler2);
        await eventBus.publish(event);
        expect(receivedEvents1.length).toBe(1);
        expect(receivedEvents2.length).toBe(1);
        expect(receivedEvents1[0].aggregateId).toBe(event.aggregateId);
        expect(receivedEvents2[0].aggregateId).toBe(event.aggregateId);
    });
    test('should support unsubscribe functionality', async () => {
        const thoughtFragment = test_data_generator_1.TestDataGenerator.generateThoughtFragment();
        const event = new thought_fragment_events_1.ThoughtFragmentCreatedEvent(thoughtFragment.id, 'test-user-id', thoughtFragment.content);
        const receivedEvents = [];
        const handler = {
            handle: (e) => {
                receivedEvents.push(e);
                return Promise.resolve();
            }
        };
        eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
        eventBus.unsubscribe('ThoughtFragmentCreatedEvent', handler);
        await eventBus.publish(event);
        expect(receivedEvents.length).toBe(0);
    });
    test('should unsubscribe all subscribers', async () => {
        const thoughtFragment = test_data_generator_1.TestDataGenerator.generateThoughtFragment();
        const event = new thought_fragment_events_1.ThoughtFragmentCreatedEvent(thoughtFragment.id, 'test-user-id', thoughtFragment.content);
        const receivedEvents = [];
        const handler = {
            handle: (e) => {
                receivedEvents.push(e);
                return Promise.resolve();
            }
        };
        eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
        eventBus.unsubscribeAll();
        await eventBus.publish(event);
        expect(receivedEvents.length).toBe(0);
    });
});
//# sourceMappingURL=event-system-integration.test.js.map