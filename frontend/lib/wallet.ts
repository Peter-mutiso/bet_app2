import { api } from "./api";


export interface WalletResponse {

  id: string;

  balance: number;

}



export async function getWallet()
: Promise<WalletResponse> {


  return api<WalletResponse>(
    "/wallet",
    {
      method: "GET",
    }
  );


}