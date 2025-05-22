"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendFromWallet,
  addPendingTransaction,
} from "@/store/slices/walletSlice";
import type {
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
} from "@/types";
import { formatCurrency } from "@/lib/currency-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export function WalletSendForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { wallet, isLoading } = useAppSelector((state) => state.wallet);
  const { accounts } = useAppSelector((state) => state.accounts);

  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    amount?: string;
    bankAccountId?: string;
  }>({});

  // Check if user has sufficient balance
  const hasSufficientBalance = wallet && Number(amount) <= wallet.balance;

  useEffect(() => {
    // Set the first account as default if available
    if (accounts.length > 0 && !bankAccountId) {
      setBankAccountId(accounts[0].id);
    }
  }, [accounts, bankAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: { amount?: string; bankAccountId?: string } = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    if (!bankAccountId) {
      newErrors.bankAccountId = "Please select a bank account";
    }

    if (!hasSufficientBalance) {
      newErrors.amount = "Insufficient balance";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors
    setErrors({});

    // Create a pending transaction
    const pendingTransaction: WalletTransaction = {
      id: uuidv4(),
      walletId: wallet?.id || "",
      userId: wallet?.userId || "",
      amount: Number(amount),
      currency: wallet?.currency || "USD",
      type: "WITHDRAWAL" as WalletTransactionType,
      status: "PENDING" as WalletTransactionStatus,
      description: description || "Send to bank account",
      fee: 0,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bankAccountId,
    };

    // Add pending transaction to the store
    dispatch(addPendingTransaction(pendingTransaction));

    try {
      // Process the send request
      await dispatch(
        sendFromWallet({
          amount: Number(amount),
          bankAccountId,
          description: description || "Send to bank account",
        })
      ).unwrap();

      // Show success message
      toast({
        title: "Send Request Submitted",
        description: `Your request to send ${formatCurrency(
          Number(amount),
          wallet?.currency || "USD"
        )} to your bank account is pending approval.`,
        variant: "default",
      });

      // Redirect to wallet page
      router.push("/dashboard/wallet");
    } catch (error) {
      // Show error message
      toast({
        title: "Send Request Failed",
        description:
          (error as Error).message ||
          "An error occurred while processing your send request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-4 py-6 pb-20">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-0 h-8 w-8"
          onClick={() => router.push("/dashboard/wallet")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Send Money</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send to Bank Account</CardTitle>
          <CardDescription>
            Transfer funds from your wallet to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="amount">Amount</Label>
                  <span className="text-sm text-muted-foreground">
                    Available:{" "}
                    {wallet
                      ? formatCurrency(wallet.balance, wallet.currency)
                      : "Loading..."}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {wallet?.currency === "USD"
                      ? "$"
                      : wallet?.currency === "EUR"
                      ? "€"
                      : wallet?.currency === "GBP"
                      ? "£"
                      : wallet?.currency === "SAR"
                      ? "﷼"
                      : "$"}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount}</p>
                )}

                {amount && !hasSufficientBalance && (
                  <div className="flex items-start mt-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
                    <span>Insufficient balance</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account</Label>
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger id="bankAccount">
                    <SelectValue placeholder="Select a bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length === 0 ? (
                      <SelectItem value="no-accounts" disabled>
                        No bank accounts available
                      </SelectItem>
                    ) : (
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountName} (****
                          {account.accountNumber.slice(-4)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.bankAccountId && (
                  <p className="text-sm text-red-500">{errors.bankAccountId}</p>
                )}
                {accounts.length === 0 && (
                  <div className="flex items-start mt-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
                    <span>
                      You need to add a bank account before you can send funds.{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary underline"
                        onClick={() => router.push("/dashboard/accounts/new")}
                      >
                        Add a bank account
                      </Button>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note for this transaction"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !hasSufficientBalance || accounts.length === 0
                }
              >
                {isLoading ? "Processing..." : "Send Money"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-sm text-muted-foreground border-t pt-4">
          <p className="mb-2">
            <strong>Note:</strong> Send requests require admin approval and
            typically take 1-3 business days to process.
          </p>
          <p>
            By proceeding, you agree to our terms and conditions regarding money
            transfers and wallet usage.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
