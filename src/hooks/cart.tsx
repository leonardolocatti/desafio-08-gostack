import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );
      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      } else {
        setProducts([]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async addedProduct => {
      const indexProductOnCart = products.findIndex(
        product => product.id === addedProduct.id,
      );

      if (indexProductOnCart >= 0) {
        setProducts(state => {
          const updatedProducts = state.map((product, index) => {
            if (index === indexProductOnCart) {
              return {
                id: product.id,
                title: product.title,
                image_url: product.image_url,
                price: product.price,
                quantity: product.quantity + 1,
              };
            }

            return product;
          });

          return updatedProducts;
        });
      } else {
        setProducts(state => [...state, { ...addedProduct, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    id => {
      async function incremendProduct(productId: string): Promise<void> {
        setProducts(state => {
          const updatedProducts = state.map(product => {
            if (product.id === productId) {
              return {
                id: product.id,
                title: product.title,
                image_url: product.image_url,
                price: product.price,
                quantity: product.quantity + 1,
              };
            }

            return product;
          });

          return updatedProducts;
        });

        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      }
      incremendProduct(id);
    },
    [products],
  );

  const decrement = useCallback(
    id => {
      async function decrementProduct(productId: string): Promise<void> {
        setProducts(state => {
          const decrementedProduct = state.find(product => product.id === id);

          if (decrementedProduct?.quantity === 1) {
            const updatedProducts = state.filter(product => product.id !== id);

            return updatedProducts;
          }

          const updatedProducts = state.map(product => {
            if (product.id === productId) {
              return {
                id: product.id,
                title: product.title,
                image_url: product.image_url,
                price: product.price,
                quantity: product.quantity - 1,
              };
            }

            return product;
          });

          return updatedProducts;
        });

        await AsyncStorage.setItem(
          '@GoMarketPlace:products',
          JSON.stringify(products),
        );
      }
      decrementProduct(id);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
