// PolyBet Pools Type Definitions

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'bet_placed'
  | 'bet_won'
  | 'bet_refund'
  | 'commission_earned'
  | 'commission_paid';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'stripe' | 'pse' | 'bold' | 'wompi';

export type MarketCategory =
  | 'sports_soccer'
  | 'sports_basketball'
  | 'sports_tennis'
  | 'sports_other'
  | 'politics'
  | 'entertainment'
  | 'prediction';

export type MarketStatus =
  | 'draft'
  | 'open'
  | 'locked'
  | 'resolving'
  | 'resolved'
  | 'cancelled';

export type BetStatus = 'active' | 'won' | 'lost' | 'refunded';

// Database types
export interface UserWallet {
  user_id: string;
  balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_wagered: number;
  total_won: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
  payment_method?: PaymentMethod;
  payment_id?: string;
  payment_metadata?: Record<string, any>;
  description?: string;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
  completed_at?: string;
}

export interface Market {
  id: number;
  category: MarketCategory;
  title: string;
  description?: string;
  options: string[]; // Array of option names
  opens_at: string;
  closes_at: string;
  event_date: string;
  betting_closes_at?: string; // When betting closes (can be different from event_date)
  status: MarketStatus;
  winning_option?: number;
  resolution_source?: string;
  resolved_by?: string;
  resolved_at?: string;
  image_url?: string;
  external_id?: string;
  metadata?: Record<string, any>;
  min_bet: number;
  max_bet: number;
  max_total_bet: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: number;
  market_id: number;
  user_id: string;
  option_index: number;
  amount: number;
  is_premium: boolean;
  commission_rate: number;
  status: BetStatus;
  payout?: number;
  commission_charged?: number;
  net_payout?: number;
  estimated_odds?: number;
  created_at: string;
  resolved_at?: string;
}

export interface PoolStats {
  market_id: number;
  option_index: number;
  total_amount: number;
  total_bets: number;
  premium_amount: number;
  premium_bets: number;
  free_amount: number;
  free_bets: number;
  updated_at: string;
}

// Extended types for frontend
export interface MarketWithStats extends Market {
  total_pool: number;
  total_bets: number;
  pool_by_option: PoolStats[];
  current_odds: number[]; // Calculated odds for each option
}

export interface BetWithMarket extends Bet {
  market: Market;
  option_name: string;
}

// API Request/Response types
export interface DepositRequest {
  amount: number;
  payment_method: PaymentMethod;
  return_url?: string;
}

export interface DepositResponse {
  success: boolean;
  transaction_id?: number;
  checkout_url?: string; // For Stripe, BOLD, Wompi
  payment_id?: string;
  message?: string;
}

export interface WithdrawRequest {
  amount: number;
  payment_method: PaymentMethod;
  account_details: {
    bank_name?: string;
    account_number?: string;
    account_type?: 'savings' | 'checking';
    id_number?: string;
    email?: string;
  };
}

export interface WithdrawResponse {
  success: boolean;
  transaction_id?: number;
  message?: string;
  estimated_completion?: string;
}

export interface PlaceBetRequest {
  market_id: number;
  option_index: number;
  amount: number;
}

export interface PlaceBetResponse {
  success: boolean;
  bet_id?: number;
  estimated_odds?: number;
  message?: string;
  new_balance?: number;
}

export interface CreateMarketRequest {
  category: MarketCategory;
  title: string;
  description?: string;
  options: string[];
  opens_at: string;
  closes_at: string;
  event_date: string;
  image_url?: string;
  external_id?: string;
  metadata?: Record<string, any>;
  min_bet?: number;
  max_bet?: number;
  max_total_bet?: number;
}

export interface ResolveMarketRequest {
  market_id: number;
  winning_option: number;
  resolution_source?: string;
}

export interface ResolveMarketResponse {
  success: boolean;
  payouts_processed?: number;
  total_payout_amount?: number;
  message?: string;
}

// Helper types
export interface OddsCalculation {
  option_index: number;
  option_name: string;
  total_in_option: number;
  estimated_odds: number;
  would_return: number; // For a $1 bet
}

export interface MarketSummary {
  market: Market;
  total_pool: number;
  total_bets: number;
  odds: OddsCalculation[];
  user_bets?: Bet[];
  closes_in_minutes?: number;
}
