import { createServices } from '../routes.js';
import { addMonths, currentMonth } from '../utils/months.js';
import { createDatabase } from './connection.js';

const db = createDatabase();
const clock = () => new Date();
const { categoriasService, lancamentosService } = createServices({ db, clock });

if (categoriasService.listar({}).length > 0) {
  console.log('Banco já possui dados. Nada a fazer.');
  process.exit(0);
}

const receitas = ['Vendas', 'Serviços', 'Outras receitas'].map((nome) => categoriasService.criar({ nome, tipo: 'RECEITA' }));
const despesas = ['Aluguel', 'Salários', 'Fornecedores', 'Marketing', 'Energia e água', 'Internet'].map((nome) =>
  categoriasService.criar({ nome, tipo: 'DESPESA' }),
);
const [vendas, servicos] = receitas;
const [aluguel, salarios, fornecedores, marketing, energia, internet] = despesas;

const mesAtual = currentMonth(clock());
const hoje = clock().getDate();

// Seis meses de histórico, com valores determinísticos (sem aleatoriedade).
for (let i = 5; i >= 0; i -= 1) {
  const mes = addMonths(mesAtual, -i);
  const ehMesAtual = i === 0;
  const dia = (d) => `${mes}-${String(Math.min(d, ehMesAtual ? Math.max(hoje, 1) : 28)).padStart(2, '0')}`;
  const status = (d) => (!ehMesAtual || d <= hoje ? 'PAGO' : 'PENDENTE');
  const variacao = 1 + ((5 - i) % 3) * 0.08;

  const itens = [
    ['Vendas da loja', vendas, Math.round(18500_00 * variacao), 10],
    ['Vendas online', vendas, Math.round(9200_00 * variacao), 18],
    ['Consultoria mensal', servicos, 4800_00, 20],
    ['Aluguel do ponto', aluguel, 3500_00, 5],
    ['Folha de pagamento', salarios, 9800_00, 5],
    ['Compra de mercadorias', fornecedores, Math.round(7400_00 * variacao), 12],
    ['Campanha de anúncios', marketing, 1200_00 + (i % 2) * 400_00, 15],
    ['Conta de energia', energia, 780_00 + i * 15_00, 22],
    ['Internet fibra', internet, 199_90, 25],
  ];

  for (const [descricao, categoria, valor, d] of itens) {
    lancamentosService.criar({
      descricao, categoria_id: categoria.id, valor_centavos: valor, data: dia(d), status: status(d),
    });
  }
}

console.log('Dados de exemplo criados com sucesso.');
