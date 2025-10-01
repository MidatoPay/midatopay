#[starknet::contract]
mod PaymentGateway {
    use starknet::{get_caller_address};
    use starknet::storage::{Map, StoragePointerReadAccess, StoragePointerWriteAccess};

    // Interfaz ERC20 simplificada
    #[starknet::interface]
    trait IERC20<TContractState> {
        fn transfer_from(
            ref self: TContractState,
            sender: felt252,
            recipient: felt252,
            amount: u256
        ) -> bool;
    }

    #[storage]
    struct Storage {
        processed_payments: Map<felt252, bool>,
        allowed_tokens: Map<felt252, bool>,
        admin: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PaymentReceived: PaymentReceived,
        PaymentProcessed: PaymentProcessed,
        TokenAdded: TokenAdded,
        TokenRemoved: TokenRemoved,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentReceived {
        #[key]
        payment_id: felt252,
        #[key]
        merchant_address: felt252,
        payer_address: felt252,
        amount: u256,
        token_address: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentProcessed {
        #[key]
        payment_id: felt252,
        merchant_address: felt252,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct TokenAdded {
        token_address: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct TokenRemoved {
        token_address: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: felt252) {
        self.admin.write(admin);
    }

    #[abi(embed_v0)]
    impl PaymentGatewayImpl of super::IPaymentGateway<ContractState> {
        fn pay(
            ref self: ContractState,
            merchant_address: felt252,
            amount: u256,
            token_address: felt252,
            payment_id: felt252
        ) -> bool {
            // Verificar que el pago no haya sido procesado
            assert(!self.processed_payments.read(payment_id), 'Payment already processed');

            // Verificar que el token esté permitido
            assert(self.allowed_tokens.read(token_address), 'Token not allowed');

            let caller = get_caller_address();

            // Verificar que la cantidad no sea cero
            assert(amount > 0, 'Amount > 0');

            // Transferencia directa del pagador al merchant
            let token = IERC20Dispatcher { contract_address: token_address.try_into().unwrap() };
            let success = token.transfer_from(caller.into(), merchant_address, amount);
            assert(success, 'Transfer failed');

            // Marcar como procesado
            self.processed_payments.write(payment_id, true);

            // Emitir eventos
            self.emit(Event::PaymentReceived(PaymentReceived {
                payment_id,
                merchant_address,
                payer_address: caller.into(),
                amount,
                token_address,
                timestamp: starknet::get_block_timestamp(),
            }));

            self.emit(Event::PaymentProcessed(PaymentProcessed {
                payment_id,
                merchant_address,
                amount,
            }));

            true
        }

        fn is_payment_processed(self: @ContractState, payment_id: felt252) -> bool {
            self.processed_payments.read(payment_id)
        }

        fn get_admin(self: @ContractState) -> felt252 {
            self.admin.read()
        }

        fn add_allowed_token(ref self: ContractState, token_address: felt252) {
            assert(get_caller_address().into() == self.admin.read(), 'Only admin');
            
            self.allowed_tokens.write(token_address, true);
            
            self.emit(Event::TokenAdded(TokenAdded {
                token_address,
            }));
        }

        fn remove_allowed_token(ref self: ContractState, token_address: felt252) {
            assert(get_caller_address().into() == self.admin.read(), 'Only admin');
            
            self.allowed_tokens.write(token_address, false);
            
            self.emit(Event::TokenRemoved(TokenRemoved {
                token_address,
            }));
        }

        fn is_token_allowed(self: @ContractState, token_address: felt252) -> bool {
            self.allowed_tokens.read(token_address)
        }
    }
}

#[starknet::interface]
trait IPaymentGateway<TContractState> {
    fn pay(
        ref self: TContractState,
        merchant_address: felt252,
        amount: u256,
        token_address: felt252,
        payment_id: felt252
    ) -> bool;
    fn is_payment_processed(self: @TContractState, payment_id: felt252) -> bool;
    fn get_admin(self: @TContractState) -> felt252;
    fn add_allowed_token(ref self: TContractState, token_address: felt252);
    fn remove_allowed_token(ref self: TContractState, token_address: felt252);
    fn is_token_allowed(self: @TContractState, token_address: felt252) -> bool;
}