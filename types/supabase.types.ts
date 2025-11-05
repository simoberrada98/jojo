export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string;
          address_line2: string | null;
          city: string;
          country: string;
          created_at: string | null;
          full_name: string;
          id: string;
          is_default: boolean | null;
          label: string;
          phone: string | null;
          postal_code: string;
          state: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          address_line1: string;
          address_line2?: string | null;
          city: string;
          country?: string;
          created_at?: string | null;
          full_name: string;
          id?: string;
          is_default?: boolean | null;
          label: string;
          phone?: string | null;
          postal_code: string;
          state: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          country?: string;
          created_at?: string | null;
          full_name?: string;
          id?: string;
          is_default?: boolean | null;
          label?: string;
          phone?: string | null;
          postal_code?: string;
          state?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      cart: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string;
          quantity: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id: string;
          quantity?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string;
          quantity?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_featured: boolean | null;
          name: string;
          position: number | null;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean | null;
          name: string;
          position?: number | null;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean | null;
          name?: string;
          position?: number | null;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          total_price: number;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          total_price?: number;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      order_tracking: {
        Row: {
          created_at: string;
          id: string;
          location: string | null;
          message: string;
          order_number: string;
          status: string;
          timestamp: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          location?: string | null;
          message: string;
          order_number: string;
          status: string;
          timestamp?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          location?: string | null;
          message?: string;
          order_number?: string;
          status?: string;
          timestamp?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          billing_address: Json | null;
          created_at: string;
          currency: string;
          id: string;
          payment_method: string | null;
          shipping_address: Json | null;
          status: string;
          total_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          billing_address?: Json | null;
          created_at?: string;
          currency: string;
          id?: string;
          payment_method?: string | null;
          shipping_address?: Json | null;
          status?: string;
          total_amount: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          billing_address?: Json | null;
          created_at?: string;
          currency?: string;
          id?: string;
          payment_method?: string | null;
          shipping_address?: Json | null;
          status?: string;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payment_attempts: {
        Row: {
          attempt_number: number;
          created_at: string;
          error: Json | null;
          id: string;
          method: string;
          payment_id: string;
          request_data: Json | null;
          response_data: Json | null;
          status: string;
        };
        Insert: {
          attempt_number: number;
          created_at?: string;
          error?: Json | null;
          id?: string;
          method: string;
          payment_id: string;
          request_data?: Json | null;
          response_data?: Json | null;
          status: string;
        };
        Update: {
          attempt_number?: number;
          created_at?: string;
          error?: Json | null;
          id?: string;
          method?: string;
          payment_id?: string;
          request_data?: Json | null;
          response_data?: Json | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_payment_attempts_payment_id';
            columns: ['payment_id'];
            isOneToOne: false;
            referencedRelation: 'payments';
            referencedColumns: ['hp_payment_id'];
          },
        ];
      };
      payment_methods: {
        Row: {
          created_at: string | null;
          crypto_address: string | null;
          crypto_currency: string | null;
          id: string;
          is_default: boolean | null;
          label: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          crypto_address?: string | null;
          crypto_currency?: string | null;
          id?: string;
          is_default?: boolean | null;
          label: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          crypto_address?: string | null;
          crypto_currency?: string | null;
          id?: string;
          is_default?: boolean | null;
          label?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          business_id: string;
          checkout_data: Json | null;
          completed_at: string | null;
          created_at: string;
          currency: string;
          customer_email: string | null;
          customer_ip: string | null;
          error_log: Json | null;
          expires_at: string | null;
          hoodpay_response: Json | null;
          hp_payment_id: string | null;
          id: string;
          metadata: Json | null;
          method: string | null;
          session_id: string;
          status: string;
          updated_at: string;
          web_payment_response: Json | null;
        };
        Insert: {
          amount: number;
          business_id: string;
          checkout_data?: Json | null;
          completed_at?: string | null;
          created_at?: string;
          currency: string;
          customer_email?: string | null;
          customer_ip?: string | null;
          error_log?: Json | null;
          expires_at?: string | null;
          hoodpay_response?: Json | null;
          hp_payment_id?: string | null;
          id?: string;
          metadata?: Json | null;
          method?: string | null;
          session_id: string;
          status: string;
          updated_at?: string;
          web_payment_response?: Json | null;
        };
        Update: {
          amount?: number;
          business_id?: string;
          checkout_data?: Json | null;
          completed_at?: string | null;
          created_at?: string;
          currency?: string;
          customer_email?: string | null;
          customer_ip?: string | null;
          error_log?: Json | null;
          expires_at?: string | null;
          hoodpay_response?: Json | null;
          hp_payment_id?: string | null;
          id?: string;
          metadata?: Json | null;
          method?: string | null;
          session_id?: string;
          status?: string;
          updated_at?: string;
          web_payment_response?: Json | null;
        };
        Relationships: [];
      };
      product_collections: {
        Row: {
          collection_id: string;
          created_at: string | null;
          id: string;
          position: number | null;
          product_id: string;
        };
        Insert: {
          collection_id: string;
          created_at?: string | null;
          id?: string;
          position?: number | null;
          product_id: string;
        };
        Update: {
          collection_id?: string;
          created_at?: string | null;
          id?: string;
          position?: number | null;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_collections_collection_id_fkey';
            columns: ['collection_id'];
            isOneToOne: false;
            referencedRelation: 'collections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_collections_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      product_option_values: {
        Row: {
          color_hex: string | null;
          created_at: string | null;
          display_value: string | null;
          id: string;
          image_url: string | null;
          is_available: boolean | null;
          option_id: string;
          position: number | null;
          value: string;
        };
        Insert: {
          color_hex?: string | null;
          created_at?: string | null;
          display_value?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          option_id: string;
          position?: number | null;
          value: string;
        };
        Update: {
          color_hex?: string | null;
          created_at?: string | null;
          display_value?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean | null;
          option_id?: string;
          position?: number | null;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_option_values_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'product_options';
            referencedColumns: ['id'];
          },
        ];
      };
      product_options: {
        Row: {
          created_at: string | null;
          display_name: string;
          id: string;
          name: string;
          position: number | null;
          product_id: string;
          required: boolean | null;
          type: string;
        };
        Insert: {
          created_at?: string | null;
          display_name: string;
          id?: string;
          name: string;
          position?: number | null;
          product_id: string;
          required?: boolean | null;
          type?: string;
        };
        Update: {
          created_at?: string | null;
          display_name?: string;
          id?: string;
          name?: string;
          position?: number | null;
          product_id?: string;
          required?: boolean | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_options_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      product_reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          helpful_count: number | null;
          id: string;
          is_approved: boolean | null;
          is_verified_purchase: boolean | null;
          product_id: string;
          rating: number;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          helpful_count?: number | null;
          id?: string;
          is_approved?: boolean | null;
          is_verified_purchase?: boolean | null;
          product_id: string;
          rating: number;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          helpful_count?: number | null;
          id?: string;
          is_approved?: boolean | null;
          is_verified_purchase?: boolean | null;
          product_id?: string;
          rating?: number;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_reviews_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      product_variants: {
        Row: {
          allow_backorder: boolean | null;
          compare_at_price: number | null;
          cost_price: number | null;
          created_at: string | null;
          dimensions_height: number | null;
          dimensions_length: number | null;
          dimensions_width: number | null;
          gtin: string | null;
          id: string;
          image_url: string | null;
          images: string[] | null;
          is_active: boolean | null;
          low_stock_threshold: number | null;
          name: string;
          options: Json | null;
          position: number | null;
          price: number | null;
          product_id: string;
          sku: string;
          stock_quantity: number | null;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          allow_backorder?: boolean | null;
          compare_at_price?: number | null;
          cost_price?: number | null;
          created_at?: string | null;
          dimensions_height?: number | null;
          dimensions_length?: number | null;
          dimensions_width?: number | null;
          gtin?: string | null;
          id?: string;
          image_url?: string | null;
          images?: string[] | null;
          is_active?: boolean | null;
          low_stock_threshold?: number | null;
          name: string;
          options?: Json | null;
          position?: number | null;
          price?: number | null;
          product_id: string;
          sku: string;
          stock_quantity?: number | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          allow_backorder?: boolean | null;
          compare_at_price?: number | null;
          cost_price?: number | null;
          created_at?: string | null;
          dimensions_height?: number | null;
          dimensions_length?: number | null;
          dimensions_width?: number | null;
          gtin?: string | null;
          id?: string;
          image_url?: string | null;
          images?: string[] | null;
          is_active?: boolean | null;
          low_stock_threshold?: number | null;
          name?: string;
          options?: Json | null;
          position?: number | null;
          price?: number | null;
          product_id?: string;
          sku?: string;
          stock_quantity?: number | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          algorithm: string | null;
          allow_backorder: boolean | null;
          base_price: number;
          brand: string | null;
          category: string;
          compare_at_price: number | null;
          cost_price: number | null;
          created_at: string | null;
          description: string | null;
          dimensions_height: number | null;
          dimensions_length: number | null;
          dimensions_width: number | null;
          efficiency: string | null;
          featured_image_url: string | null;
          gtin: string | null;
          hash_rate: string | null;
          id: string;
          images: string[] | null;
          is_active: boolean | null;
          is_archived: boolean | null;
          is_featured: boolean | null;
          low_stock_threshold: number | null;
          meta_description: string | null;
          meta_keywords: string[] | null;
          meta_title: string | null;
          model_3d_url: string | null;
          name: string;
          power_consumption: string | null;
          published_at: string | null;
          short_description: string | null;
          sku: string;
          slug: string;
          stock_quantity: number | null;
          tags: string[] | null;
          track_inventory: boolean | null;
          updated_at: string | null;
          video_url: string | null;
          weight: number | null;
        };
        Insert: {
          algorithm?: string | null;
          allow_backorder?: boolean | null;
          base_price: number;
          brand?: string | null;
          category: string;
          compare_at_price?: number | null;
          cost_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          dimensions_height?: number | null;
          dimensions_length?: number | null;
          dimensions_width?: number | null;
          efficiency?: string | null;
          featured_image_url?: string | null;
          gtin?: string | null;
          hash_rate?: string | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_archived?: boolean | null;
          is_featured?: boolean | null;
          low_stock_threshold?: number | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          meta_title?: string | null;
          model_3d_url?: string | null;
          name: string;
          power_consumption?: string | null;
          published_at?: string | null;
          short_description?: string | null;
          sku: string;
          slug: string;
          stock_quantity?: number | null;
          tags?: string[] | null;
          track_inventory?: boolean | null;
          updated_at?: string | null;
          video_url?: string | null;
          weight?: number | null;
        };
        Update: {
          algorithm?: string | null;
          allow_backorder?: boolean | null;
          base_price?: number;
          brand?: string | null;
          category?: string;
          compare_at_price?: number | null;
          cost_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          dimensions_height?: number | null;
          dimensions_length?: number | null;
          dimensions_width?: number | null;
          efficiency?: string | null;
          featured_image_url?: string | null;
          gtin?: string | null;
          hash_rate?: string | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_archived?: boolean | null;
          is_featured?: boolean | null;
          low_stock_threshold?: number | null;
          meta_description?: string | null;
          meta_keywords?: string[] | null;
          meta_title?: string | null;
          model_3d_url?: string | null;
          name?: string;
          power_consumption?: string | null;
          published_at?: string | null;
          short_description?: string | null;
          sku?: string;
          slug?: string;
          stock_quantity?: number | null;
          tags?: string[] | null;
          track_inventory?: boolean | null;
          updated_at?: string | null;
          video_url?: string | null;
          weight?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          business_id: string | null;
          event_type: string;
          id: string;
          payload: Json;
          payment_id: string | null;
          processed: boolean;
          processed_at: string | null;
          processing_error: string | null;
          received_at: string;
          retry_count: number;
          signature: string | null;
          verified: boolean;
        };
        Insert: {
          business_id?: string | null;
          event_type: string;
          id?: string;
          payload: Json;
          payment_id?: string | null;
          processed?: boolean;
          processed_at?: string | null;
          processing_error?: string | null;
          received_at?: string;
          retry_count?: number;
          signature?: string | null;
          verified?: boolean;
        };
        Update: {
          business_id?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json;
          payment_id?: string | null;
          processed?: boolean;
          processed_at?: string | null;
          processing_error?: string | null;
          received_at?: string;
          retry_count?: number;
          signature?: string | null;
          verified?: boolean;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          created_at: string | null;
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlist_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      wishlist_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      complete_payment_with_order: {
        Args: {
          p_metadata_patch?: Json;
          p_order_payload?: Json;
          p_payment_id: string;
          p_user_id?: string;
        };
        Returns: Json;
      };
      delete_user_and_dependents: {
        Args: { user_id: string };
        Returns: undefined;
      };
      generate_order_number: { Args: never; Returns: string };
      generate_unique_slug: {
        Args: { base_slug: string; table_name: string };
        Returns: string;
      };
      get_my_claim: { Args: { claim: string }; Returns: Json };
      get_product_average_rating: {
        Args: { product_id: string };
        Returns: number;
      };
      get_product_display_price: {
        Args: { product_id: string };
        Returns: number;
      };
      get_product_total_stock: {
        Args: { product_id: string };
        Returns: number;
      };
      set_user_as_admin: { Args: { user_id: string }; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
