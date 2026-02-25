import json
import base64
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

class InstructionType(Enum):
    TRANSFER = "TRANSFER"
    SWAP = "SWAP"
    STAKE = "STAKE"
    UNSTAKE = "UNSTAKE"
    CREATE_ACCOUNT = "CREATE_ACCOUNT"
    CLOSE_ACCOUNT = "CLOSE_ACCOUNT"
    UNKNOWN = "UNKNOWN"

@dataclass
class ParsedInstruction:
    program_id: str
    instruction_type: InstructionType
    accounts: List[str]
    data: bytes
    parsed_data: Optional[Dict[str, Any]] = None

class TransactionAnalyzer:
    def __init__(self):
        self.known_programs = {
            "11111111111111111111111111111111": "System Program",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Token Program",
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL": "Associated Token Program",
            "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": "Serum DEX",
        }
        
        self.instruction_discriminators = {
            b'\x02\x00\x00\x00': InstructionType.TRANSFER,
            b'\x03\x00\x00\x00': InstructionType.CREATE_ACCOUNT,
            b'\x09\x00\x00\x00': InstructionType.CLOSE_ACCOUNT,
        }

    def analyze_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a Solana transaction and extract meaningful information
        """
        instructions = transaction_data.get('transaction', {}).get('message', {}).get('instructions', [])
        
        parsed_instructions = []
        for instruction in instructions:
            parsed = self.parse_instruction(instruction)
            parsed_instructions.append(parsed)
        
        analysis = {
            'total_instructions': len(instructions),
            'parsed_instructions': [self._instruction_to_dict(pi) for pi in parsed_instructions],
            'program_interactions': self._count_program_interactions(parsed_instructions),
            'risk_indicators': self._identify_risk_indicators(parsed_instructions),
            'estimated_cost': self._estimate_transaction_cost(parsed_instructions),
            'complexity_score': self._calculate_complexity(parsed_instructions)
        }
        
        return analysis

    def parse_instruction(self, instruction: Dict[str, Any]) -> ParsedInstruction:
        """
        Parse a single instruction from the transaction
        """
        program_id = instruction.get('programId', '')
        accounts = instruction.get('accounts', [])
        data = base64.b64decode(instruction.get('data', ''))
        
        instruction_type = self._identify_instruction_type(program_id, data)
        parsed_data = self._parse_instruction_data(instruction_type, data)
        
        return ParsedInstruction(
            program_id=program_id,
            instruction_type=instruction_type,
            accounts=accounts,
            data=data,
            parsed_data=parsed_data
        )

    def _identify_instruction_type(self, program_id: str, data: bytes) -> InstructionType:
        """
        Identify the type of instruction based on program ID and data
        """
        if len(data) < 4:
            return InstructionType.UNKNOWN
        
        discriminator = data[:4]
        
        if discriminator in self.instruction_discriminators:
            return self.instruction_discriminators[discriminator]
        
        # Check for known program patterns
        if program_id == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA":
            if data[0] == 3:
                return InstructionType.TRANSFER
        
        return InstructionType.UNKNOWN

    def _parse_instruction_data(self, instruction_type: InstructionType, data: bytes) -> Optional[Dict[str, Any]]:
        """
        Parse instruction data based on type
        """
        if instruction_type == InstructionType.TRANSFER:
            if len(data) >= 12:
                amount = int.from_bytes(data[4:12], byteorder='little')
                return {'amount': amount}
        
        elif instruction_type == InstructionType.SWAP:
            if len(data) >= 20:
                amount_in = int.from_bytes(data[4:12], byteorder='little')
                min_amount_out = int.from_bytes(data[12:20], byteorder='little')
                return {
                    'amount_in': amount_in,
                    'min_amount_out': min_amount_out,
                    'slippage': self._calculate_slippage(amount_in, min_amount_out)
                }
        
        return None

    def _calculate_slippage(self, amount_in: int, min_amount_out: int) -> float:
        """
        Calculate slippage percentage
        """
        if amount_in == 0:
            return 0.0
        return ((amount_in - min_amount_out) / amount_in) * 100

    def _count_program_interactions(self, instructions: List[ParsedInstruction]) -> Dict[str, int]:
        """
        Count interactions with each program
        """
        interactions = {}
        for instruction in instructions:
            program_name = self.known_programs.get(
                instruction.program_id,
                instruction.program_id[:8] + "..."
            )
            interactions[program_name] = interactions.get(program_name, 0) + 1
        
        return interactions

    def _identify_risk_indicators(self, instructions: List[ParsedInstruction]) -> List[str]:
        """
        Identify potential risk indicators in the transaction
        """
        risks = []
        
        # Check for unknown programs
        unknown_programs = [i for i in instructions if i.program_id not in self.known_programs]
        if len(unknown_programs) > 0:
            risks.append(f"Interacting with {len(unknown_programs)} unknown program(s)")
        
        # Check for high slippage
        for instruction in instructions:
            if instruction.parsed_data and 'slippage' in instruction.parsed_data:
                slippage = instruction.parsed_data['slippage']
                if slippage > 5.0:
                    risks.append(f"High slippage detected: {slippage:.2f}%")
        
        # Check for account closures
        close_instructions = [i for i in instructions if i.instruction_type == InstructionType.CLOSE_ACCOUNT]
        if len(close_instructions) > 0:
            risks.append(f"Transaction closes {len(close_instructions)} account(s)")
        
        # Check for complex transaction patterns
        if len(instructions) > 10:
            risks.append(f"Complex transaction with {len(instructions)} instructions")
        
        return risks

    def _estimate_transaction_cost(self, instructions: List[ParsedInstruction]) -> Dict[str, Any]:
        """
        Estimate the cost of the transaction
        """
        base_fee = 5000  # lamports
        per_signature_fee = 5000
        per_instruction_fee = 0
        
        total_cost = base_fee + (len(instructions) * per_instruction_fee)
        
        return {
            'estimated_lamports': total_cost,
            'estimated_sol': total_cost / 1e9,
            'breakdown': {
                'base_fee': base_fee,
                'instruction_fees': per_instruction_fee * len(instructions)
            }
        }

    def _calculate_complexity(self, instructions: List[ParsedInstruction]) -> float:
        """
        Calculate a complexity score for the transaction
        """
        score = 0.0
        
        # Base score from instruction count
        score += len(instructions) * 10
        
        # Add score for unique programs
        unique_programs = len(set(i.program_id for i in instructions))
        score += unique_programs * 15
        
        # Add score for unknown programs
        unknown_count = len([i for i in instructions if i.program_id not in self.known_programs])
        score += unknown_count * 25
        
        # Normalize to 0-100 scale
        return min(score, 100)

    def _instruction_to_dict(self, instruction: ParsedInstruction) -> Dict[str, Any]:
        """
        Convert ParsedInstruction to dictionary
        """
        return {
            'program_id': instruction.program_id,
            'program_name': self.known_programs.get(instruction.program_id, 'Unknown'),
            'instruction_type': instruction.instruction_type.value,
            'accounts': instruction.accounts,
            'parsed_data': instruction.parsed_data
        }

def main():
    analyzer = TransactionAnalyzer()
    
    # Example transaction data
    sample_transaction = {
        'transaction': {
            'message': {
                'instructions': [
                    {
                        'programId': 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
                        'accounts': ['account1', 'account2'],
                        'data': base64.b64encode(b'\x03\x00\x00\x00\x10\x27\x00\x00\x00\x00\x00\x00').decode()
                    }
                ]
            }
        }
    }
    
    result = analyzer.analyze_transaction(sample_transaction)
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
