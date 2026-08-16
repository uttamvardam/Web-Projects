"""
TaxClarity - Dedicated Section 87A Rebate & Marginal Relief Calculation Module (Python)
Official statutory provisions for AY 2026–27 (FY 2025–26) under Indian Income Tax Act.
"""

from dataclasses import dataclass

@dataclass
class RebateResult:
    tax_before_rebate: float
    rebate_87a: float
    tax_after_rebate: float
    marginal_relief: float
    tax_after_relief: float
    eligible_for_87a: bool
    reason: str


OLD_87A_INCOME_LIMIT = 500_000
OLD_87A_MAX_REBATE = 12_500

NEW_87A_INCOME_LIMIT = 1_200_000
NEW_87A_MAX_REBATE = 60_000


def calculate_old_regime_87a(
    total_income: float,
    normal_slab_tax: float,
    is_resident: bool = True,
) -> RebateResult:
    """
    Calculate Section 87A rebate for Old Tax Regime.
    """
    # 87A is only for resident individuals
    if not is_resident:
        return RebateResult(
            tax_before_rebate=normal_slab_tax,
            rebate_87a=0.0,
            tax_after_rebate=normal_slab_tax,
            marginal_relief=0.0,
            tax_after_relief=normal_slab_tax,
            eligible_for_87a=False,
            reason="87A not available to non-resident individual."
        )

    # Income above Rs. 5 lakh gets no Old Regime 87A rebate
    if total_income > OLD_87A_INCOME_LIMIT:
        return RebateResult(
            tax_before_rebate=normal_slab_tax,
            rebate_87a=0.0,
            tax_after_rebate=normal_slab_tax,
            marginal_relief=0.0,
            tax_after_relief=normal_slab_tax,
            eligible_for_87a=False,
            reason="Total income exceeds Rs. 5 lakh."
        )

    rebate = min(normal_slab_tax, OLD_87A_MAX_REBATE)
    tax_after_rebate = max(0.0, normal_slab_tax - rebate)
    return RebateResult(
        tax_before_rebate=normal_slab_tax,
        rebate_87a=rebate,
        tax_after_rebate=tax_after_rebate,
        marginal_relief=0.0,
        tax_after_relief=tax_after_rebate,
        eligible_for_87a=True,
        reason="Eligible for Old Regime Section 87A rebate."
    )


def calculate_new_regime_87a(
    total_income: float,
    normal_slab_tax: float,
    is_resident: bool = True,
) -> RebateResult:
    """
    Calculate Section 87A rebate and marginal relief for New Tax Regime (AY 2026-27).
    """
    # 87A / marginal relief is restricted to resident individuals
    if not is_resident:
        return RebateResult(
            tax_before_rebate=normal_slab_tax,
            rebate_87a=0.0,
            tax_after_rebate=normal_slab_tax,
            marginal_relief=0.0,
            tax_after_relief=normal_slab_tax,
            eligible_for_87a=False,
            reason="87A/marginal relief not available to non-resident individual."
        )

    # Up to Rs. 12 lakh: normal 87A rebate
    if total_income <= NEW_87A_INCOME_LIMIT:
        rebate = min(normal_slab_tax, NEW_87A_MAX_REBATE)
        tax_after_rebate = max(0.0, normal_slab_tax - rebate)
        return RebateResult(
            tax_before_rebate=normal_slab_tax,
            rebate_87a=rebate,
            tax_after_rebate=tax_after_rebate,
            marginal_relief=0.0,
            tax_after_relief=tax_after_rebate,
            eligible_for_87a=True,
            reason="Eligible for New Regime Section 87A rebate."
        )

    # Above Rs. 12 lakh: no normal 87A rebate; evaluate marginal relief
    excess_income = total_income - NEW_87A_INCOME_LIMIT
    potential_relief = normal_slab_tax - excess_income

    if potential_relief > 0:
        marginal_relief = potential_relief
    else:
        marginal_relief = 0.0

    tax_after_relief = normal_slab_tax - marginal_relief

    return RebateResult(
        tax_before_rebate=normal_slab_tax,
        rebate_87a=0.0,
        tax_after_rebate=normal_slab_tax,
        marginal_relief=marginal_relief,
        tax_after_relief=tax_after_relief,
        eligible_for_87a=False,
        reason=(
            "Income exceeds Rs. 12 lakh; marginal relief evaluated."
            if marginal_relief > 0
            else "Income exceeds marginal-relief range."
        )
    )


def calculate_new_regime_slab_tax(taxable_income: float) -> float:
    """
    Official AY 2026-27 (FY 2025-26) New Regime Slab Rates (Section 115BAC):
    - Up to Rs. 4,00,000: Nil
    - Rs. 4,00,001 to Rs. 8,00,000: 5%
    - Rs. 8,00,001 to Rs. 12,00,000: 10%
    - Rs. 12,00,001 to Rs. 16,00,000: 15%
    - Rs. 16,00,001 to Rs. 20,00,000: 20%
    - Rs. 20,00,001 to Rs. 24,00,000: 25%
    - Above Rs. 24,00,000: 30%
    """
    if taxable_income <= 400_000:
        return 0.0

    tax = 0.0

    # Rs. 4L - Rs. 8L @ 5%
    slab = min(taxable_income, 800_000) - 400_000
    if slab > 0:
        tax += slab * 0.05

    # Rs. 8L - Rs. 12L @ 10%
    slab = min(taxable_income, 1_200_000) - 800_000
    if slab > 0:
        tax += slab * 0.10

    # Rs. 12L - Rs. 16L @ 15%
    slab = min(taxable_income, 1_600_000) - 1_200_000
    if slab > 0:
        tax += slab * 0.15

    # Rs. 16L - Rs. 20L @ 20%
    slab = min(taxable_income, 2_000_000) - 1_600_000
    if slab > 0:
        tax += slab * 0.20

    # Rs. 20L - Rs. 24L @ 25%
    slab = min(taxable_income, 2_400_000) - 2_000_000
    if slab > 0:
        tax += slab * 0.25

    # Above Rs. 24L @ 30%
    if taxable_income > 2_400_000:
        tax += (taxable_income - 2_400_000) * 0.30

    return tax


def calculate_old_regime_slab_tax(taxable_income: float) -> float:
    """
    Old Regime Slab Rates (General Individual below 60):
    - Up to Rs. 2,50,000: Nil
    - Rs. 2,50,001 to Rs. 5,00,000: 5%
    - Rs. 5,00,001 to Rs. 10,00,000: 20%
    - Above Rs. 10,00,000: 30%
    """
    if taxable_income <= 250_000:
        return 0.0

    tax = 0.0

    # Rs. 2.5L - Rs. 5L @ 5%
    slab = min(taxable_income, 500_000) - 250_000
    if slab > 0:
        tax += slab * 0.05

    # Rs. 5L - Rs. 10L @ 20%
    slab = min(taxable_income, 1_000_000) - 500_000
    if slab > 0:
        tax += slab * 0.20

    # Above Rs. 10L @ 30%
    if taxable_income > 1_000_000:
        tax += (taxable_income - 1_000_000) * 0.30

    return tax


if __name__ == "__main__":
    print("Testing Section 87A & Marginal Relief (Python Engine)...")
    
    # 1. Old Regime Rs. 4,00,000
    t = calculate_old_regime_slab_tax(400_000)
    r = calculate_old_regime_87a(400_000, t)
    print(f"Case 1: Old 4L -> Tax: {t}, Rebate: {r.rebate_87a}, After: {r.tax_after_relief}")
    
    # 2. Old Regime Rs. 5,00,000
    t = calculate_old_regime_slab_tax(500_000)
    r = calculate_old_regime_87a(500_000, t)
    print(f"Case 2: Old 5L -> Tax: {t}, Rebate: {r.rebate_87a}, After: {r.tax_after_relief}")
    
    # 3. Old Regime Rs. 5,10,000
    t = calculate_old_regime_slab_tax(510_000)
    r = calculate_old_regime_87a(510_000, t)
    print(f"Case 3: Old 5.1L -> Tax: {t}, Rebate: {r.rebate_87a}, After: {r.tax_after_relief}")
    
    # 4. New Regime Rs. 11,75,000
    t = calculate_new_regime_slab_tax(1_175_000)
    r = calculate_new_regime_87a(1_175_000, t)
    print(f"Case 4: New 11.75L -> Tax: {t}, Rebate: {r.rebate_87a}, After: {r.tax_after_relief}")

    # 5. New Regime Rs. 12,00,000
    t = calculate_new_regime_slab_tax(1_200_000)
    r = calculate_new_regime_87a(1_200_000, t)
    print(f"Case 5: New 12L -> Tax: {t}, Rebate: {r.rebate_87a}, After: {r.tax_after_relief}")

    # 6. New Regime Rs. 12,01,000
    t = calculate_new_regime_slab_tax(1_201_000)
    r = calculate_new_regime_87a(1_201_000, t)
    print(f"Case 6: New 12.01L -> Tax: {t}, Rebate: {r.rebate_87a}, Relief: {r.marginal_relief}, After: {r.tax_after_relief}")

    # 7. New Regime Rs. 12,10,000
    t = calculate_new_regime_slab_tax(1_210_000)
    r = calculate_new_regime_87a(1_210_000, t)
    print(f"Case 7: New 12.10L -> Tax: {t}, Rebate: {r.rebate_87a}, Relief: {r.marginal_relief}, After: {r.tax_after_relief}")

    # 8. New Regime Rs. 12,50,000
    t = calculate_new_regime_slab_tax(1_250_000)
    r = calculate_new_regime_87a(1_250_000, t)
    print(f"Case 8: New 12.50L -> Tax: {t}, Rebate: {r.rebate_87a}, Relief: {r.marginal_relief}, After: {r.tax_after_relief}")

    # 9. New Regime Rs. 12,70,588
    t = calculate_new_regime_slab_tax(1_270_588)
    r = calculate_new_regime_87a(1_270_588, t)
    print(f"Case 9: New 12.70588L -> Tax: {t}, Rebate: {r.rebate_87a}, Relief: {r.marginal_relief}, After: {r.tax_after_relief}")
