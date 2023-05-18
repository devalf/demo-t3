export type Product = {
  guid: string;
  title: string;
  picture: string;
  company: string;
  about: string;
  registered: string;
  tags?: string[];
  price: number;
  productCondition?: string;
};
