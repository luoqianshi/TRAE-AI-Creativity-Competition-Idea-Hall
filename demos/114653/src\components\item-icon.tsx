import { BatteryCharging, Box, BriefcaseBusiness, Circle, CupSoda, Dna, Drumstick, Egg, Fish, Headphones, HeartPulse, KeyRound, Laptop, Leaf, Milk, Package, Pill, Shield, Smartphone, Sprout, Umbrella, WalletCards } from 'lucide-react'

const icons = { circle: Circle, fish: Fish, milk: Milk, leaf: Leaf, egg: Egg, sprout: Sprout, drumstick: Drumstick, cherry: Circle, pill: Pill, heart: HeartPulse, shield: Shield, package: Package, dna: Dna, bandage: Package, phone: Smartphone, key: KeyRound, wallet: WalletCards, umbrella: Umbrella, laptop: Laptop, battery: BatteryCharging, headphones: Headphones, badge: BriefcaseBusiness, cup: CupSoda, box: Box }

export function ItemIcon({ name, size = 26 }: { name: string; size?: number }) { const Icon = icons[name as keyof typeof icons] ?? Circle; return <Icon size={size} strokeWidth={1.6} /> }
