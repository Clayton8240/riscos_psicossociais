import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

def add_bullet_points(text_frame, text_list):
    text_frame.clear()
    for i, text in enumerate(text_list):
        p = text_frame.paragraphs[0] if i == 0 else text_frame.add_paragraph()
        p.text = text
        p.font.size = Pt(20)
        p.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
        p.level = 0

def create_rich_ppt():
    prs = Presentation()
    # Set to 16:9 aspect ratio
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # ---------------------------------------------------
    # Slide 1: Capa
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    title.text = "Gestão de Riscos Psicossociais"
    subtitle.text = "Mapeamento preditivo, estatística avançada e planos de ação para transformar a saúde mental do seu time."
    
    # ---------------------------------------------------
    # Slide 2: Problema vs Solução (Texto)
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "O Desafio do RH Moderno"
    tf = slide.placeholders[1].text_frame
    bullet_points = [
        "O Problema:",
        "• Pesquisas de clima rasas não geram dados acionáveis.",
        "• Dificuldade em rastrear se o problema é estrutural ou de um setor específico.",
        "• Falta de ferramentas que acompanhem a mitigação do risco de ponta a ponta.",
        "• Risco jurídico no tratamento de dados sensíveis (LGPD).",
        "",
        "A Nossa Solução:",
        "• Uma plataforma centralizada com inteligência estatística determinística e totalmente offline.",
        "• Foco em Probabilidade e Impacto real."
    ]
    add_bullet_points(tf, bullet_points)

    # ---------------------------------------------------
    # Slide 3: Surveys (Imagem + Texto)
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[5])
    slide.shapes.title.text = "1. Pesquisas Direcionadas (Surveys)"
    
    # Adicionando Imagem
    try:
        slide.shapes.add_picture('surveys.png', Inches(0.5), Inches(1.5), width=Inches(8))
    except Exception as e:
        print("Imagem surveys.png não encontrada. Ignorando.")

    # Adicionando Texto
    txbox = slide.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(4.2), Inches(5))
    tf = txbox.text_frame
    tf.word_wrap = True
    add_bullet_points(tf, [
        "Coleta de Dados Precisos:",
        "",
        "• Interface fluida que estimula o engajamento do colaborador.",
        "• Avaliação em Duas Dimensões: O funcionário aponta a Probabilidade (frequência) e o Impacto (severidade) do risco.",
        "• Mapeia a raiz do problema (ex: carga horária, suporte, clareza)."
    ])

    # ---------------------------------------------------
    # Slide 4: Dashboard (Imagem + Texto)
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[5])
    slide.shapes.title.text = "2. Dashboard e Motor Analítico"
    
    try:
        slide.shapes.add_picture('dashboard.png', Inches(0.5), Inches(1.5), width=Inches(8))
    except Exception as e:
        print("Imagem dashboard.png não encontrada. Ignorando.")

    txbox = slide.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(4.2), Inches(5))
    tf = txbox.text_frame
    tf.word_wrap = True
    add_bullet_points(tf, [
        "Estatística além das 'médias':",
        "",
        "• Cálculo de Polarização: Identifica se há disparidade no ambiente (ex: saudáveis ao lado de pessoas em burnout) através do Desvio Padrão.",
        "• Confiabilidade da Amostra: Utiliza o Alfa de Cronbach para garantir que a pesquisa faz sentido.",
        "• Matriz de Riscos de fácil visualização gerencial."
    ])

    # ---------------------------------------------------
    # Slide 5: Action Plans (Imagem + Texto)
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[5])
    slide.shapes.title.text = "3. Planos de Ação (Kanban)"
    
    try:
        slide.shapes.add_picture('action_plans.png', Inches(0.5), Inches(1.5), width=Inches(8))
    except Exception as e:
        print("Imagem action_plans.png não encontrada. Ignorando.")

    txbox = slide.shapes.add_textbox(Inches(8.8), Inches(1.5), Inches(4.2), Inches(5))
    tf = txbox.text_frame
    tf.word_wrap = True
    add_bullet_points(tf, [
        "Do Diagnóstico à Solução:",
        "",
        "• O risco foi detectado. E agora? Transforme-o em uma tarefa de mitigação.",
        "• Painel Kanban visual (Aberto, Em Andamento, Resolvido).",
        "• Designe responsáveis e defina prazos para a melhoria do clima e retenção de talentos."
    ])

    # ---------------------------------------------------
    # Slide 6: Diferenciais e Segurança
    # ---------------------------------------------------
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Diferenciais Exclusivos (Privacidade e LGPD)"
    tf = slide.placeholders[1].text_frame
    add_bullet_points(tf, [
        "• Privacidade By Design: Nosso sistema impossibilita o rastreio individual. As respostas são vinculadas apenas ao Setor da empresa.",
        "• Segurança 100% Autônoma: Todo o processamento matemático acontece de forma fechada no sistema.",
        "• Sem Vazamento de Dados: NÃO enviamos as informações sensíveis de saúde mental dos seus colaboradores para IAs públicas como o ChatGPT.",
        "• SaaS Web Prático: Rápida implementação sem burocracias de infraestrutura local."
    ])

    prs.save('Apresentacao_Riscos_Psicossociais_Comercial.pptx')
    print("Apresentação enriquecida gerada com sucesso!")

if __name__ == '__main__':
    create_rich_ppt()
