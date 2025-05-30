"use client";

import type React from "react";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BankAccount } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BankIcon } from "@/components/accounts/bank-icon";
import { formatCurrency } from "@/lib/currency-utils";

interface AccountCardProps {
  account: BankAccount;
  onClick?: () => void;
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formatAccountNumber = (accountNumber: string) => {
    // Show only last 4 digits
    return `•••• •••• •••• ${accountNumber.slice(-4)}`;
  };

  const handleShare = (method: string) => {
    // In a real app, this would integrate with the Web Share API or native sharing
    toast({
      title: `Shared via ${method}`,
      description: `Account details have been shared via ${method}`,
    });
    setIsShareOpen(false);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Generate a gradient based on the bank name for visual variety
  const getCardGradient = (bankName: string) => {
    const gradients = [
      "bg-gradient-to-r from-blue-600 to-blue-400",
      "bg-gradient-to-r from-purple-600 to-purple-400",
      "bg-gradient-to-r from-emerald-600 to-emerald-400",
      "bg-gradient-to-r from-rose-600 to-rose-400",
      "bg-gradient-to-r from-amber-600 to-amber-400",
    ];

    // Use a hash of the bank name to select a consistent gradient
    const hash = bankName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  return (
    <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300">
      <div
        className={cn(
          "relative rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl",
          getCardGradient(account.bankName),
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/20 to-transparent" />

        {/* Card content */}
        <div className="p-6 text-white relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">{account.bankName}</p>
              <h3 className="font-bold text-lg mt-1">{account.accountName}</h3>
            </div>
            <div onClick={handleShareClick}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare("Email")}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("SMS")}>
                    SMS
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("Copy Link")}>
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm opacity-80">Card Number</p>
            <p className="font-mono text-lg tracking-wider">
              {formatAccountNumber(account.accountNumber)}
            </p>
          </div>

          <div className="mt-6 flex justify-end items-end">
            {account.isDefault && (
              <div className="bg-white/20 px-2 py-1 rounded text-xs font-medium">
                Default
              </div>
            )}
          </div>
        </div>

        {/* Card chip design - updated with better styling */}
        <div className="absolute top-6 right-6">
          <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-400 border border-yellow-500/30 shadow-inner grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-yellow-600/30 rounded-[1px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
