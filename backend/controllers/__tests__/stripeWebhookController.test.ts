// Refactored test suite for robust mocking and injection
let handleStripeWebhook: any;
let mockConstructEvent: jest.Mock;
let mockEq: jest.Mock;
let mockJson: jest.Mock;
let mockStatus: jest.Mock;
let mockSend: jest.Mock;
let mockRes: any;

const baseReq = {
  headers: { 'stripe-signature': 'testsig' },
  body: 'rawbody',
};

describe('handleStripeWebhook', () => {
  beforeEach(async () => {
    jest.resetModules();
    mockConstructEvent = jest.fn();
    mockEq = jest.fn();
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn(() => ({ send: mockSend }));
    mockRes = { status: mockStatus, send: mockSend, json: mockJson };

    jest.doMock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: { constructEvent: mockConstructEvent },
      }));
    });

    jest.doMock('../../services/supabaseService', () => ({
      supabaseAdmin: {
        from: jest.fn(() => ({
          update: jest.fn(() => ({ eq: mockEq })),
        })),
      },
    }));

    ({ handleStripeWebhook } = await import('../stripeWebhookController'));
  });

  it('should 400 on invalid signature', async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error('Invalid signature'); });
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Webhook Error'));
  });

  it('should update is_paid and stripe_customer_id on valid checkout.session.completed', async () => {
    jest.resetModules();
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'user123' }, customer: 'cus_456' } },
    });
    const mockEq = jest.fn().mockResolvedValue({ error: null, data: { id: 'user123', is_paid: true, stripe_customer_id: 'cus_456' } });
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ update: mockUpdate }));
    jest.doMock('../../services/supabaseService', () => ({
      supabaseAdmin: { from: mockFrom },
    }));
    const { handleStripeWebhook } = await import('../stripeWebhookController');
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ is_paid: true, stripe_customer_id: 'cus_456' });
    expect(mockEq).toHaveBeenCalledWith('id', 'user123');
    expect(mockJson).toHaveBeenCalledWith({ received: true });
  });

  it('should handle missing customerId in session object', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'user123' } } },
    });
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockEq).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ received: true });
  });

  it('should handle supabase update error', async () => {
    jest.resetModules();
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'user123' }, customer: 'cus_456' } },
    });
    const mockEq = jest.fn().mockResolvedValue({ error: 'fail', data: null });
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ update: mockUpdate }));
    jest.doMock('../../services/supabaseService', () => ({
      supabaseAdmin: { from: mockFrom },
    }));
    const { handleStripeWebhook } = await import('../stripeWebhookController');
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ is_paid: true, stripe_customer_id: 'cus_456' });
    expect(mockEq).toHaveBeenCalledWith('id', 'user123');
    expect(mockJson).toHaveBeenCalledWith({ received: true });
  });

  it('should ignore unhandled event types', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    });
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockEq).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ received: true });
  });

  it('should 400 if stripe-signature header missing', async () => {
    const req = { ...baseReq, headers: {} } as any;
    mockConstructEvent.mockImplementation(() => { throw new Error('No signature'); });
    await handleStripeWebhook(req, mockRes);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('Webhook Error'));
  });

  it('should handle supabaseAdmin not initialized', async () => {
    jest.resetModules();
    mockConstructEvent = jest.fn();
    mockEq = jest.fn();
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn(() => ({ send: mockSend }));
    mockRes = { status: mockStatus, send: mockSend, json: mockJson };
    jest.doMock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: { constructEvent: mockConstructEvent },
      }));
    });
    jest.doMock('../../services/supabaseService', () => ({ supabaseAdmin: null }));
    ({ handleStripeWebhook } = await import('../stripeWebhookController'));
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { metadata: { userId: 'user123' } } },
    });
    const req = { ...baseReq } as any;
    await handleStripeWebhook(req, mockRes);
    expect(mockEq).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ received: true });
  });
}); 