export type APIProduct = {
  guid: string;
  title: string;
  picture: string;
  company: string;
  about: string;
  registered: string;
  tags?: string[];
  price: number;
  product_condition?: string;
};
