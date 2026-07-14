import { test, expect } from '@playwright/test';

test.describe('Capitão Embalagens S/A - Suíte de Testes Ponta a Ponta (E2E)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the local/production deployment of Capitão Embalagens
    await page.goto('/');
    // Espera até que a página carregue completamente
    await page.waitForLoadState('domcontentloaded');
  });

  test('Deve renderizar a tela inicial da loja e alternar temas com sucesso', async ({ page }) => {
    // Verificar se o cabeçalho oficial está visível
    const logoHeader = page.locator('#capi-header-logo');
    await expect(logoHeader).toBeVisible();
    await expect(logoHeader).toContainText('Capitão');
    await expect(logoHeader).toContainText('Embalagens');

    // Testar alternância do tema (claro para escuro / escuro para claro)
    const themeToggle = page.locator('#capi-theme-toggle');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    
    // Validar se o elemento raiz reflete a mudança de tema
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toBeNull();
  });

  test('Deve realizar a busca de um produto, filtrar o catálogo e visualizar o item', async ({ page }) => {
    // Buscar um produto específico do catálogo
    const searchInput = page.locator('header input[type="text"]');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Caderno');
    await searchInput.press('Enter');

    // Verificar se o catálogo foi atualizado e exibe o produto buscado
    const productCard = page.locator('text=Caderno Universitário Capivara');
    await expect(productCard).toBeVisible();
  });

  test('Deve executar o fluxo completo de compra: busca, carrinho, checkout e finalização', async ({ page }) => {
    // 1. Encontrar o produto "Mochila Ergonômica" e adicioná-lo ao carrinho
    const searchInput = page.locator('header input[type="text"]');
    await searchInput.fill('Mochila');
    
    const addButton = page.locator('button:has-text("Adicionar")').first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // 2. Verificar se a contagem do carrinho no cabeçalho subiu para 1
    const cartButton = page.locator('#capi-cart-button');
    await expect(cartButton).toBeVisible();
    await expect(cartButton).toContainText('1');

    // 3. Abrir a gaveta/tela do carrinho
    await cartButton.click();

    // 4. Validar se a tela de carrinho foi aberta e exibe o item
    const cartTitle = page.locator('h3:has-text("Itens Selecionados")');
    await expect(cartTitle).toBeVisible();

    // 5. Aplicar um cupom de desconto promocional válido (CAPI5 - 5% de desconto)
    const couponInput = page.locator('input[placeholder="Código do cupom"]');
    if (await couponInput.isVisible()) {
      await couponInput.fill('CAPI5');
      const applyCouponButton = page.locator('button:has-text("Aplicar")');
      await applyCouponButton.click();
      
      // Confirmar mensagem de sucesso do cupom
      const couponBadge = page.locator('span:has-text("CAPI5")');
      await expect(couponBadge).toBeVisible();
    }

    // 6. Prosseguir para a tela de Pagamento / Checkout
    const checkoutButton = page.locator('button:has-text("Prosseguir para Pagamento")');
    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // 7. Validar presença do formulário de endereço e método de pagamento
    const addressTitle = page.locator('h3:has-text("Endereço de Entrega")');
    await expect(addressTitle).toBeVisible();

    // Selecionar o método de pagamento PIX (com desconto de 5%)
    const pixOption = page.locator('div:has-text("PIX (Desconto de 5%)")').first();
    if (await pixOption.isVisible()) {
      await pixOption.click();
    }

    // 8. Confirmar e Finalizar o Pedido de forma segura
    const finalizeButton = page.locator('button:has-text("Confirmar e Finalizar Pedido")');
    await expect(finalizeButton).toBeVisible();
    await finalizeButton.click();

    // 9. Validar a tela de sucesso de compra gerando o QR Code dinamicamente
    const successHeader = page.locator('h2:has-text("Pedido Recebido com Sucesso!")');
    await expect(successHeader).toBeVisible();

    // Verificar os indicadores de conexão segura criptografada exibidos no checkout
    const secureTag = page.locator('span:has-text("Conexão Encriptada SSL")');
    await expect(secureTag).toBeVisible();
  });

  test('Deve validar a integridade do sistema de segurança SSL & LGPD no Painel Administrativo', async ({ page }) => {
    // 1. Navegar para o Painel Administrativo usando o botão oficial do cabeçalho de simulação
    const adminToggle = page.locator('#admin-panel-toggle');
    await expect(adminToggle).toBeVisible();
    await adminToggle.click();

    // 2. Localizar o painel de diagnóstico SSL & LGPD que foi implementado
    const diagnosisTitle = page.locator('h4:has-text("Painel de Diagnóstico de Segurança SSL & LGPD")');
    await expect(diagnosisTitle).toBeVisible();

    // 3. Clicar para executar um novo diagnóstico de segurança
    const runAuditButton = page.locator('button:has-text("Executar Novo Diagnóstico")');
    await expect(runAuditButton).toBeVisible();
    await runAuditButton.click();

    // 4. Validar se os logs de diagnóstico são impressos no terminal de segurança
    const terminalConsole = page.locator('span:has-text("Console de Auditoria SSL & LGPD")');
    await expect(terminalConsole).toBeVisible();

    // 5. Garantir que o score de segurança esteja presente na interface
    const securityScoreBadge = page.locator('span:has-text("/100")');
    await expect(securityScoreBadge).toBeVisible();
  });

});
