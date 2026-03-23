import { InMemoryEventBus, EventHandler } from '../../events/event-bus';
import { ThoughtFragmentCreatedEvent } from '../../../domain/events/thought-fragment-events';
import { TestDataGenerator } from '../../../__test__/test-data-generator';

describe('EventSystem Integration Tests', () => {
  let eventBus: InMemoryEventBus;

  beforeEach(() => {
    eventBus = new InMemoryEventBus();
  });

  test('should publish and subscribe to events', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    const event = new ThoughtFragmentCreatedEvent(
      thoughtFragment.id, 
      'test-user-id', 
      thoughtFragment.content
    );
    const receivedEvents: any[] = [];

    // Create event handler
    const handler: EventHandler<ThoughtFragmentCreatedEvent> = {
      handle: (e) => {
        receivedEvents.push(e);
        return Promise.resolve();
      }
    };

    // Act
    eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
    await eventBus.publish(event);

    // Assert
    expect(receivedEvents.length).toBe(1);
    expect(receivedEvents[0]).toBeInstanceOf(ThoughtFragmentCreatedEvent);
    expect(receivedEvents[0].aggregateId).toBe(event.aggregateId);
    expect(receivedEvents[0].userId).toBe(event.userId);
    expect(receivedEvents[0].content).toBe(event.content);
  });

  test('should support multiple subscribers for the same event', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    const event = new ThoughtFragmentCreatedEvent(
      thoughtFragment.id, 
      'test-user-id', 
      thoughtFragment.content
    );
    const receivedEvents1: any[] = [];
    const receivedEvents2: any[] = [];

    // Create event handlers
    const handler1: EventHandler<ThoughtFragmentCreatedEvent> = {
      handle: (e) => {
        receivedEvents1.push(e);
        return Promise.resolve();
      }
    };

    const handler2: EventHandler<ThoughtFragmentCreatedEvent> = {
      handle: (e) => {
        receivedEvents2.push(e);
        return Promise.resolve();
      }
    };

    // Act
    eventBus.subscribe('ThoughtFragmentCreatedEvent', handler1);
    eventBus.subscribe('ThoughtFragmentCreatedEvent', handler2);
    await eventBus.publish(event);

    // Assert
    expect(receivedEvents1.length).toBe(1);
    expect(receivedEvents2.length).toBe(1);
    expect(receivedEvents1[0].aggregateId).toBe(event.aggregateId);
    expect(receivedEvents2[0].aggregateId).toBe(event.aggregateId);
  });

  test('should support unsubscribe functionality', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    const event = new ThoughtFragmentCreatedEvent(
      thoughtFragment.id, 
      'test-user-id', 
      thoughtFragment.content
    );
    const receivedEvents: any[] = [];

    // Create event handler
    const handler: EventHandler<ThoughtFragmentCreatedEvent> = {
      handle: (e) => {
        receivedEvents.push(e);
        return Promise.resolve();
      }
    };

    // Act
    eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
    eventBus.unsubscribe('ThoughtFragmentCreatedEvent', handler);
    await eventBus.publish(event);

    // Assert
    expect(receivedEvents.length).toBe(0);
  });

  test('should unsubscribe all subscribers', async () => {
    // Arrange
    const thoughtFragment = TestDataGenerator.generateThoughtFragment();
    const event = new ThoughtFragmentCreatedEvent(
      thoughtFragment.id, 
      'test-user-id', 
      thoughtFragment.content
    );
    const receivedEvents: any[] = [];

    // Create event handler
    const handler: EventHandler<ThoughtFragmentCreatedEvent> = {
      handle: (e) => {
        receivedEvents.push(e);
        return Promise.resolve();
      }
    };

    // Act
    eventBus.subscribe('ThoughtFragmentCreatedEvent', handler);
    eventBus.unsubscribeAll();
    await eventBus.publish(event);

    // Assert
    expect(receivedEvents.length).toBe(0);
  });
});