import type { ConversionProductSlug } from './productConversionContent'

export type NonRetatrutideProductSlug = Exclude<ConversionProductSlug, 'retatrutide'>

export type ProductTrendCard = {
  title: string
  body: string
}

export type ProductTrendContent = {
  eyebrow: string
  heading: string
  body: string
  cards: readonly [ProductTrendCard, ProductTrendCard, ProductTrendCard]
  context: string
}

type Locale = 'en' | 'es'
type ProductHighlightCore = Pick<ProductTrendContent, 'heading' | 'body' | 'cards'>
type LocalizedHighlightCore = Record<Locale, ProductHighlightCore>
type LocalizedTrendCards = Record<Locale, ProductTrendContent['cards']>

const productHighlightContent = {
  tesamorelin: {
    en: {
      heading: 'Why Tesamorelin gets attention.',
      body: 'A direct look at the abdominal-fat question, the hormone pathway involved, and where the strongest human evidence applies.',
      cards: [
        {
          title: 'Abdominal fat, measured directly',
          body: 'Controlled studies used medical imaging to track deep abdominal fat—not just changes on a scale.',
        },
        {
          title: 'A natural signaling chain',
          body: 'Tesamorelin activates the GHRH pathway, prompting growth-hormone release and downstream IGF-1 signaling.',
        },
        {
          title: 'Where the evidence is strongest',
          body: 'The clearest human findings come from adults with HIV-associated lipodystrophy studied with regulated prescription material.',
        },
      ],
    },
    es: {
      heading: 'Por qué Tesamorelin llama la atención.',
      body: 'Una mirada directa a la grasa abdominal, la vía hormonal involucrada y dónde aplica la evidencia humana más sólida.',
      cards: [
        {
          title: 'Grasa abdominal medida directamente',
          body: 'Estudios controlados usaron imágenes médicas para seguir la grasa abdominal profunda, no solo cambios en la báscula.',
        },
        {
          title: 'Una cadena natural de señales',
          body: 'Tesamorelin activa la vía GHRH, promoviendo la liberación de hormona del crecimiento y la señal posterior de IGF-1.',
        },
        {
          title: 'Dónde es más sólida la evidencia',
          body: 'Los hallazgos humanos más claros provienen de adultos con lipodistrofia asociada al VIH estudiados con material farmacéutico regulado.',
        },
      ],
    },
  },
  'wolverine-stack': {
    en: {
      heading: 'Why Wolverine Stack gets attention.',
      body: 'Two recovery-focused research paths are placed together, while the role of each component stays clear.',
      cards: [
        {
          title: 'Two distinct paths in one format',
          body: 'BPC-157 and TB-500 are paired because both appear in tissue-response research, but they are different compounds with separate evidence.',
        },
        {
          title: 'The BPC-157 side',
          body: 'BPC-157 research follows blood-vessel, connective-tissue, and injury-response signals across controlled models.',
        },
        {
          title: 'The TB-500 side',
          body: 'TB-500 research follows thymosin-beta-4-related signals involved in cell movement and tissue organization. The exact blend remains an open research question.',
        },
      ],
    },
    es: {
      heading: 'Por qué Wolverine Stack llama la atención.',
      body: 'Reúne dos rutas de investigación enfocadas en recuperación, manteniendo clara la función de cada componente.',
      cards: [
        {
          title: 'Dos rutas distintas en un formato',
          body: 'BPC-157 y TB-500 se combinan porque ambos aparecen en investigación de respuesta tisular, pero son compuestos diferentes con evidencia separada.',
        },
        {
          title: 'El lado de BPC-157',
          body: 'La investigación de BPC-157 sigue señales de vasos sanguíneos, tejido conectivo y respuesta a lesiones en modelos controlados.',
        },
        {
          title: 'El lado de TB-500',
          body: 'La investigación de TB-500 sigue señales relacionadas con thymosin-beta-4 que participan en movimiento celular y organización tisular. La mezcla exacta sigue siendo una pregunta abierta.',
        },
      ],
    },
  },
  klow: {
    en: {
      heading: 'Why KLOW gets attention.',
      body: 'Four ingredients bring skin, tissue-response, cell-movement, and inflammatory-signaling questions into one research blend.',
      cards: [
        {
          title: 'Four research ideas together',
          body: 'KLOW combines GHK-Cu, BPC-157, TB-500, and KPV instead of approaching recovery or appearance as a one-pathway question.',
        },
        {
          title: 'Structure and remodeling',
          body: 'GHK-Cu brings copper-peptide and skin-matrix research, while BPC-157 and TB-500 add tissue-response and cell-movement questions.',
        },
        {
          title: 'A separate signaling angle',
          body: 'KPV adds an inflammatory-signaling research path. How all four components behave together has not yet been defined in clinical studies.',
        },
      ],
    },
    es: {
      heading: 'Por qué KLOW llama la atención.',
      body: 'Cuatro ingredientes reúnen preguntas sobre piel, respuesta tisular, movimiento celular y señales inflamatorias en una mezcla.',
      cards: [
        {
          title: 'Cuatro ideas de investigación juntas',
          body: 'KLOW combina GHK-Cu, BPC-157, TB-500 y KPV en vez de presentar recuperación o apariencia como una pregunta de una sola vía.',
        },
        {
          title: 'Estructura y remodelación',
          body: 'GHK-Cu aporta investigación de péptidos de cobre y matriz de piel; BPC-157 y TB-500 añaden preguntas sobre respuesta tisular y movimiento celular.',
        },
        {
          title: 'Un ángulo distinto de señalización',
          body: 'KPV añade una vía de investigación de señales inflamatorias. Aún no se ha definido clínicamente cómo se comportan juntos los cuatro componentes.',
        },
      ],
    },
  },
  'igf1-lr3': {
    en: {
      heading: 'Why IGF1-LR3 gets attention.',
      body: 'A longer-acting IGF-1 analog puts growth signaling, nutrient use, and receptor response at the center of the research.',
      cards: [
        {
          title: 'Built for a longer signal',
          body: 'LR3 is a modified IGF-1 analog designed to interact differently with binding proteins and remain active longer in research models.',
        },
        {
          title: 'Growth and nutrient signaling',
          body: 'The IGF-1 receptor helps cells coordinate growth, protein-building signals, and how available nutrients are used.',
        },
        {
          title: 'A clear evidence boundary',
          body: 'Most LR3 findings come from cell and controlled model research; human clinical evidence belongs to different regulated IGF-1 medicines.',
        },
      ],
    },
    es: {
      heading: 'Por qué IGF1-LR3 llama la atención.',
      body: 'Un análogo de IGF-1 de acción más larga coloca en el centro el crecimiento, el uso de nutrientes y la respuesta del receptor.',
      cards: [
        {
          title: 'Diseñado para una señal más larga',
          body: 'LR3 es un análogo modificado de IGF-1 creado para interactuar de forma distinta con proteínas de unión y permanecer activo por más tiempo en modelos de investigación.',
        },
        {
          title: 'Crecimiento y uso de nutrientes',
          body: 'El receptor de IGF-1 ayuda a las células a coordinar crecimiento, señales de formación de proteínas y el uso de nutrientes disponibles.',
        },
        {
          title: 'Un límite claro de evidencia',
          body: 'La mayoría de los hallazgos de LR3 provienen de células y modelos controlados; la evidencia clínica humana pertenece a medicamentos regulados distintos.',
        },
      ],
    },
  },
  'cjc1295-ipamorelin': {
    en: {
      heading: 'Why CJC-1295 + Ipamorelin gets attention.',
      body: 'Two different receptor signals meet at the same growth-hormone pathway, creating a focused way to study timing and response.',
      cards: [
        {
          title: 'Two signals, one pathway',
          body: 'CJC-1295 acts through the GHRH receptor, while Ipamorelin acts through the ghrelin receptor. Both sit upstream of growth-hormone release.',
        },
        {
          title: 'Why researchers pair them',
          body: 'The combination lets researchers examine how complementary signals may shape the size and timing of a hormone response.',
        },
        {
          title: 'What human studies measured',
          body: 'Short studies of the separate compounds recorded hormone changes; sleep, recovery, and body-composition outcomes from the exact blend remain open questions.',
        },
      ],
    },
    es: {
      heading: 'Por qué CJC-1295 + Ipamorelin llama la atención.',
      body: 'Dos señales de receptores diferentes llegan a la misma vía de hormona del crecimiento para estudiar tiempo y respuesta.',
      cards: [
        {
          title: 'Dos señales, una vía',
          body: 'CJC-1295 actúa mediante el receptor GHRH e Ipamorelin mediante el receptor de grelina. Ambos están antes de la liberación de hormona del crecimiento.',
        },
        {
          title: 'Por qué se estudian juntos',
          body: 'La combinación permite examinar cómo señales complementarias pueden cambiar el tamaño y el momento de una respuesta hormonal.',
        },
        {
          title: 'Qué midieron los estudios humanos',
          body: 'Estudios cortos de los compuestos separados registraron cambios hormonales; sueño, recuperación y composición corporal con la mezcla exacta siguen siendo preguntas abiertas.',
        },
      ],
    },
  },
  'mots-c': {
    en: {
      heading: 'Why MOTS-C gets attention.',
      body: 'A peptide made from mitochondrial DNA connects cellular energy, metabolic stress, and exercise-response research.',
      cards: [
        {
          title: 'A signal from the mitochondria',
          body: 'MOTS-C is encoded inside mitochondrial DNA and is studied as a messenger between the cell’s energy system and the rest of the body.',
        },
        {
          title: 'Energy use under pressure',
          body: 'Research links MOTS-C with AMPK-related signaling, glucose handling, and how cells adapt when energy demand rises.',
        },
        {
          title: 'What human research tracks',
          body: 'Human studies have mainly measured the body’s own MOTS-C during exercise; research on administered MOTS-C is still at an earlier stage.',
        },
      ],
    },
    es: {
      heading: 'Por qué MOTS-C llama la atención.',
      body: 'Un péptido originado en el ADN mitocondrial conecta energía celular, estrés metabólico y respuesta al ejercicio.',
      cards: [
        {
          title: 'Una señal de las mitocondrias',
          body: 'MOTS-C está codificado dentro del ADN mitocondrial y se estudia como mensajero entre el sistema energético celular y el resto del organismo.',
        },
        {
          title: 'Uso de energía bajo presión',
          body: 'La investigación relaciona MOTS-C con señalización asociada a AMPK, manejo de glucosa y adaptación celular cuando aumenta la demanda de energía.',
        },
        {
          title: 'Qué sigue la investigación humana',
          body: 'Los estudios humanos han medido principalmente el MOTS-C natural del cuerpo durante ejercicio; la investigación con MOTS-C administrado está en una etapa más temprana.',
        },
      ],
    },
  },
  'aod-9604': {
    en: {
      heading: 'Why AOD-9604 gets attention.',
      body: 'A clear look at its targeted design, the metabolic question behind it, and why researchers continue to follow it.',
      cards: [
        {
          title: 'Designed around fat metabolism',
          body: 'AOD-9604 is a small fragment of growth hormone created to study fat-use signaling without using the entire hormone.',
        },
        {
          title: 'A more targeted research idea',
          body: 'Instead of recreating everything growth hormone does, it narrows the research question to how stored fat is broken down and used.',
        },
        {
          title: 'Why researchers keep watching it',
          body: 'Early studies created strong interest around body composition, while human research continues to define how consistently that idea translates.',
        },
      ],
    },
    es: {
      heading: 'Por qué AOD-9604 llama la atención.',
      body: 'Una mirada clara a su diseño específico, la pregunta metabólica que lo impulsa y por qué los investigadores continúan siguiéndolo.',
      cards: [
        {
          title: 'Diseñado en torno al metabolismo de la grasa',
          body: 'AOD-9604 es un pequeño fragmento de la hormona del crecimiento creado para estudiar señales relacionadas con el uso de grasa sin emplear la hormona completa.',
        },
        {
          title: 'Una idea de investigación más específica',
          body: 'En vez de reproducir todo lo que hace la hormona del crecimiento, limita la pregunta a cómo se descompone y utiliza la grasa almacenada.',
        },
        {
          title: 'Por qué los investigadores siguen atentos',
          body: 'Los primeros estudios despertaron gran interés en la composición corporal, mientras la investigación en humanos continúa definiendo qué tan consistente es esa idea.',
        },
      ],
    },
  },
  'nad-plus': {
    en: {
      heading: 'Why NAD+ gets so much attention.',
      body: 'NAD+ sits inside cellular energy transfer, stress response, and aging research—three important ideas explained without the jargon.',
      cards: [
        {
          title: 'It carries cellular energy',
          body: 'The NAD+/NADH cycle moves electrons between reactions, helping cells turn nutrients into usable energy.',
        },
        {
          title: 'Stress-response enzymes use it',
          body: 'Enzyme families involved in signaling and DNA-repair biology consume NAD+, connecting it with how cells respond to stress.',
        },
        {
          title: 'The direct evidence is still growing',
          body: 'NAD biology is well established, while human outcome research on administered NAD+ remains limited and depends heavily on the delivery route.',
        },
      ],
    },
    es: {
      heading: 'Por qué NAD+ genera tanta atención.',
      body: 'NAD+ participa en transferencia de energía, respuesta al estrés y envejecimiento celular: tres ideas importantes explicadas sin tecnicismos.',
      cards: [
        {
          title: 'Transporta energía celular',
          body: 'El ciclo NAD+/NADH mueve electrones entre reacciones y ayuda a las células a convertir nutrientes en energía utilizable.',
        },
        {
          title: 'Las enzimas de respuesta lo utilizan',
          body: 'Familias de enzimas involucradas en señalización y reparación del ADN consumen NAD+, conectándolo con la respuesta celular al estrés.',
        },
        {
          title: 'La evidencia directa sigue creciendo',
          body: 'La biología de NAD está bien establecida, mientras los resultados humanos con NAD+ administrado siguen siendo limitados y dependen mucho de la vía.',
        },
      ],
    },
  },
  glutathione: {
    en: {
      heading: 'Why Glutathione gets attention.',
      body: 'One of the cell’s central antioxidant systems connects oxidative stress, recycling capacity, and route-specific research.',
      cards: [
        {
          title: 'The cell’s recycling antioxidant',
          body: 'Glutathione helps neutralize reactive compounds and can be regenerated, making it part of a reusable cellular defense cycle.',
        },
        {
          title: 'A window into oxidative stress',
          body: 'Researchers follow the balance between reduced GSH and oxidized GSSG to understand how cells are handling chemical stress.',
        },
        {
          title: 'The delivery route changes the story',
          body: 'Oral, topical, and other formats produce different exposure and findings, so results from one route cannot simply be transferred to another.',
        },
      ],
    },
    es: {
      heading: 'Por qué Glutathione llama la atención.',
      body: 'Uno de los sistemas antioxidantes centrales de la célula conecta estrés oxidativo, reciclaje y evidencia según la vía.',
      cards: [
        {
          title: 'El antioxidante reciclable de la célula',
          body: 'El glutatión ayuda a neutralizar compuestos reactivos y puede regenerarse, formando parte de un ciclo reutilizable de defensa celular.',
        },
        {
          title: 'Una ventana al estrés oxidativo',
          body: 'Los investigadores siguen el equilibrio entre GSH reducido y GSSG oxidado para entender cómo manejan las células el estrés químico.',
        },
        {
          title: 'La vía cambia la historia',
          body: 'Los formatos oral, tópico y otros producen exposiciones y hallazgos distintos; los resultados de una vía no se transfieren automáticamente a otra.',
        },
      ],
    },
  },
  'ghk-cu': {
    en: {
      heading: 'Why GHK-Cu gets attention.',
      body: 'A naturally occurring copper peptide brings skin structure, collagen-matrix, and cellular-remodeling research together.',
      cards: [
        {
          title: 'A copper-carrying signal',
          body: 'GHK binds copper and is studied as a small signaling complex that can influence how cells organize and respond.',
        },
        {
          title: 'The skin-structure connection',
          body: 'Research follows fibroblasts, collagen-related matrix signals, cell movement, and wound-response biology.',
        },
        {
          title: 'Format makes a real difference',
          body: 'Topical, cultured-cell, and other research formats are not interchangeable; each route creates a different evidence question.',
        },
      ],
    },
    es: {
      heading: 'Por qué GHK-Cu llama la atención.',
      body: 'Un péptido de cobre natural reúne investigación de estructura cutánea, matriz de colágeno y remodelación celular.',
      cards: [
        {
          title: 'Una señal que transporta cobre',
          body: 'GHK se une al cobre y se estudia como un pequeño complejo de señalización que puede influir en la organización y respuesta celular.',
        },
        {
          title: 'La conexión con la estructura de la piel',
          body: 'La investigación sigue fibroblastos, señales de matriz relacionadas con colágeno, movimiento celular y biología de respuesta a heridas.',
        },
        {
          title: 'El formato hace una diferencia real',
          body: 'Los formatos tópicos, celulares y otros no son intercambiables; cada vía crea una pregunta de evidencia diferente.',
        },
      ],
    },
  },
  'ahk-cu': {
    en: {
      heading: 'Why AHK-Cu gets attention.',
      body: 'This copper peptide has a narrower story centered on hair follicles and scalp-cell research.',
      cards: [
        {
          title: 'A follicle-focused research target',
          body: 'AHK-Cu has been examined with isolated human hair follicles and cultured scalp cells rather than broad appearance claims.',
        },
        {
          title: 'Different from GHK-Cu',
          body: 'AHK-Cu has its own peptide sequence and evidence. Findings from the better-known GHK-Cu cannot automatically be assigned to it.',
        },
        {
          title: 'Small but specific evidence',
          body: 'One directly relevant laboratory study reported follicle and scalp-cell changes; how that translates in people remains an active question.',
        },
      ],
    },
    es: {
      heading: 'Por qué AHK-Cu llama la atención.',
      body: 'Este péptido de cobre tiene una historia más específica centrada en folículos y células del cuero cabelludo.',
      cards: [
        {
          title: 'Un objetivo enfocado en folículos',
          body: 'AHK-Cu se ha examinado con folículos humanos aislados y células cultivadas del cuero cabelludo, no mediante afirmaciones generales de apariencia.',
        },
        {
          title: 'Diferente de GHK-Cu',
          body: 'AHK-Cu tiene su propia secuencia y evidencia. Los hallazgos del GHK-Cu más conocido no pueden asignarse automáticamente a este péptido.',
        },
        {
          title: 'Evidencia pequeña pero específica',
          body: 'Un estudio de laboratorio directamente relevante reportó cambios en folículos y células del cuero cabelludo; su traducción a personas sigue siendo una pregunta activa.',
        },
      ],
    },
  },
  epithalon: {
    en: {
      heading: 'Why Epithalon gets attention.',
      body: 'A short peptide sits at the intersection of telomere biology, cellular aging, and the search for measurable longevity signals.',
      cards: [
        {
          title: 'Built around the telomere question',
          body: 'Telomeres protect chromosome ends and change as cells divide, making them a visible marker in cellular-aging research.',
        },
        {
          title: 'Why longevity researchers notice it',
          body: 'Epithalon has been studied for possible effects on telomere-related and telomerase activity in controlled cell systems.',
        },
        {
          title: 'What the research can say today',
          body: 'Modern findings describe cultured-cell changes. Whether those signals translate into slower human aging or longer life remains unanswered.',
        },
      ],
    },
    es: {
      heading: 'Por qué Epithalon llama la atención.',
      body: 'Un péptido corto conecta la biología de telómeros, el envejecimiento celular y la búsqueda de señales medibles de longevidad.',
      cards: [
        {
          title: 'Construido alrededor de los telómeros',
          body: 'Los telómeros protegen los extremos de los cromosomas y cambian cuando las células se dividen, por eso sirven como marcador del envejecimiento celular.',
        },
        {
          title: 'Por qué interesa en longevidad',
          body: 'Epithalon se ha estudiado por posibles efectos sobre señales de telómeros y actividad de telomerasa en sistemas celulares controlados.',
        },
        {
          title: 'Qué puede decir hoy la investigación',
          body: 'Los hallazgos modernos describen cambios en células cultivadas. Aún no se sabe si se traducen en envejecimiento humano más lento o vida más larga.',
        },
      ],
    },
  },
  cerebrolysin: {
    en: {
      heading: 'Why Cerebrolysin gets attention.',
      body: 'Unlike a single peptide, Cerebrolysin is a complex mixture studied across brain-recovery and cognitive research.',
      cards: [
        {
          title: 'A mixture, not one molecule',
          body: 'Cerebrolysin contains multiple low-molecular-weight peptides, creating a broader research profile than a single-target compound.',
        },
        {
          title: 'A long neurological research history',
          body: 'Human trials have measured stroke recovery, cognition, function, and dementia-related outcomes in specific populations.',
        },
        {
          title: 'Why the evidence stays nuanced',
          body: 'Human studies exist, but systematic reviews find mixed results and differing certainty depending on the condition and outcome measured.',
        },
      ],
    },
    es: {
      heading: 'Por qué Cerebrolysin llama la atención.',
      body: 'A diferencia de un solo péptido, Cerebrolysin es una mezcla compleja estudiada en recuperación cerebral y cognición.',
      cards: [
        {
          title: 'Una mezcla, no una sola molécula',
          body: 'Cerebrolysin contiene varios péptidos de bajo peso molecular, creando un perfil de investigación más amplio que un compuesto de un solo objetivo.',
        },
        {
          title: 'Una larga historia neurológica',
          body: 'Ensayos humanos han medido recuperación tras derrame, cognición, función y resultados relacionados con demencia en poblaciones específicas.',
        },
        {
          title: 'Por qué la evidencia requiere matices',
          body: 'Existen estudios humanos, pero las revisiones sistemáticas encuentran resultados mixtos y distinta certeza según la condición y el resultado medido.',
        },
      ],
    },
  },
  ss31: {
    en: {
      heading: 'Why SS-31 gets attention.',
      body: 'A mitochondria-targeted peptide focuses on the membrane that supports efficient cellular energy production.',
      cards: [
        {
          title: 'Designed to reach mitochondria',
          body: 'SS-31, also studied as elamipretide, interacts with cardiolipin inside the mitochondrial membrane.',
        },
        {
          title: 'Protecting the energy-making environment',
          body: 'Researchers examine whether stabilizing that membrane changes energy production and the way cells respond to metabolic stress.',
        },
        {
          title: 'A strong but narrow human signal',
          body: 'Regulated elamipretide research has reached approval in one rare-disease setting, while broader energy and endurance questions remain separate.',
        },
      ],
    },
    es: {
      heading: 'Por qué SS-31 llama la atención.',
      body: 'Un péptido dirigido a las mitocondrias se enfoca en la membrana que sostiene una producción eficiente de energía celular.',
      cards: [
        {
          title: 'Diseñado para llegar a las mitocondrias',
          body: 'SS-31, también estudiado como elamipretida, interactúa con cardiolipina dentro de la membrana mitocondrial.',
        },
        {
          title: 'Proteger el entorno que produce energía',
          body: 'Los investigadores examinan si estabilizar esa membrana cambia la producción de energía y la respuesta celular al estrés metabólico.',
        },
        {
          title: 'Una señal humana sólida pero limitada',
          body: 'La investigación regulada de elamipretida alcanzó aprobación en una enfermedad rara; las preguntas generales de energía y resistencia permanecen separadas.',
        },
      ],
    },
  },
  dsip: {
    en: {
      heading: 'Why DSIP gets attention.',
      body: 'Its name points directly to sleep, but the useful research story is about sleep architecture and neuroendocrine signaling.',
      cards: [
        {
          title: 'The name began with sleep',
          body: 'Delta sleep-inducing peptide was first connected with slow-wave sleep, creating the “deep sleep” interest that still surrounds it.',
        },
        {
          title: 'More than hours asleep',
          body: 'Early studies looked at sleep stages, electrical brain activity, and hormone-related signals—not simply whether someone slept longer.',
        },
        {
          title: 'Why the question remains open',
          body: 'Two very small controlled human studies produced different-strength findings, leaving dependable sleep effects unresolved.',
        },
      ],
    },
    es: {
      heading: 'Por qué DSIP llama la atención.',
      body: 'Su nombre apunta directamente al sueño, pero la historia útil trata de arquitectura del sueño y señales neuroendocrinas.',
      cards: [
        {
          title: 'El nombre comenzó con el sueño',
          body: 'Delta sleep-inducing peptide se relacionó inicialmente con sueño de ondas lentas, creando el interés en “sueño profundo” que todavía lo rodea.',
        },
        {
          title: 'Más que horas dormidas',
          body: 'Los primeros estudios observaron etapas del sueño, actividad eléctrica cerebral y señales hormonales, no solo si alguien dormía más tiempo.',
        },
        {
          title: 'Por qué la pregunta sigue abierta',
          body: 'Dos estudios humanos controlados y muy pequeños produjeron hallazgos de distinta fuerza, dejando sin resolver un efecto confiable sobre el sueño.',
        },
      ],
    },
  },
  kisspeptin: {
    en: {
      heading: 'Why Kisspeptin gets attention.',
      body: 'Kisspeptin sits near the starting point of reproductive hormone signaling, linking brain signals with fertility research.',
      cards: [
        {
          title: 'Where the reproductive signal begins',
          body: 'Kisspeptin activates neurons that release GnRH, which then helps coordinate LH and FSH hormone signals.',
        },
        {
          title: 'Why fertility researchers follow it',
          body: 'That upstream position makes it useful for studying hormone release, egg maturation, and selected fertility procedures.',
        },
        {
          title: 'What early human studies measured',
          body: 'Small studies recorded hormone changes, IVF-related egg maturation, and sexual-response measures in carefully selected populations.',
        },
      ],
    },
    es: {
      heading: 'Por qué Kisspeptin llama la atención.',
      body: 'Kisspeptin está cerca del inicio de la señal hormonal reproductiva y conecta señales cerebrales con investigación de fertilidad.',
      cards: [
        {
          title: 'Dónde comienza la señal reproductiva',
          body: 'Kisspeptin activa neuronas que liberan GnRH, ayudando después a coordinar las señales hormonales LH y FSH.',
        },
        {
          title: 'Por qué interesa en fertilidad',
          body: 'Esa posición inicial la hace útil para estudiar liberación hormonal, maduración de óvulos y ciertos procedimientos de fertilidad.',
        },
        {
          title: 'Qué midieron los primeros estudios humanos',
          body: 'Estudios pequeños registraron cambios hormonales, maduración de óvulos en FIV y medidas de respuesta sexual en poblaciones cuidadosamente seleccionadas.',
        },
      ],
    },
  },
  hcg: {
    en: {
      heading: 'Why HCG gets attention.',
      body: 'A well-known reproductive hormone signal connects laboratory receptor research with a narrow set of established medical contexts.',
      cards: [
        {
          title: 'It acts like an LH signal',
          body: 'HCG binds the LH/CG receptor, allowing researchers to follow downstream reproductive and hormone-production responses.',
        },
        {
          title: 'A defined fertility connection',
          body: 'Regulated HCG medicines have established roles in selected fertility and hormone conditions under clinical supervision.',
        },
        {
          title: 'Why context matters',
          body: 'The human evidence supports specific regulated uses and is much narrower than the broad performance, hormone, or weight claims seen online.',
        },
      ],
    },
    es: {
      heading: 'Por qué HCG llama la atención.',
      body: 'Una señal hormonal reproductiva conocida conecta investigación de receptores con un grupo limitado de contextos médicos establecidos.',
      cards: [
        {
          title: 'Actúa como una señal de LH',
          body: 'HCG se une al receptor LH/CG, permitiendo seguir respuestas reproductivas y de producción hormonal posteriores.',
        },
        {
          title: 'Una conexión definida con fertilidad',
          body: 'Los medicamentos regulados de HCG tienen funciones establecidas en ciertas condiciones de fertilidad y hormonas bajo supervisión clínica.',
        },
        {
          title: 'Por qué importa el contexto',
          body: 'La evidencia humana respalda usos regulados específicos y es mucho más limitada que las afirmaciones amplias de rendimiento, hormonas o peso en internet.',
        },
      ],
    },
  },
  'hgh-191aa': {
    en: {
      heading: 'Why HGH 191AA gets attention.',
      body: 'Full-length human growth-hormone structure creates a direct research path into GH receptors and downstream IGF signaling.',
      cards: [
        {
          title: 'The complete 191-amino-acid sequence',
          body: 'HGH 191AA refers to the full-length sequence of human growth hormone rather than a smaller fragment or releasing signal.',
        },
        {
          title: 'A direct receptor pathway',
          body: 'It activates the growth-hormone receptor, which then influences IGF-1 and other signals involved in growth and metabolism.',
        },
        {
          title: 'Where human evidence applies',
          body: 'Regulated somatropin has defined uses for specific growth-hormone deficiencies and conditions; enhancement questions fall outside that evidence.',
        },
      ],
    },
    es: {
      heading: 'Por qué HGH 191AA llama la atención.',
      body: 'La estructura completa de hormona del crecimiento humana crea una ruta directa hacia receptores GH y señales posteriores de IGF.',
      cards: [
        {
          title: 'La secuencia completa de 191 aminoácidos',
          body: 'HGH 191AA se refiere a la secuencia completa de la hormona del crecimiento humana, no a un fragmento pequeño ni a una señal liberadora.',
        },
        {
          title: 'Una vía directa al receptor',
          body: 'Activa el receptor de hormona del crecimiento, que después influye en IGF-1 y otras señales relacionadas con crecimiento y metabolismo.',
        },
        {
          title: 'Dónde aplica la evidencia humana',
          body: 'La somatropina regulada tiene usos definidos para ciertas deficiencias y condiciones; las preguntas de mejora quedan fuera de esa evidencia.',
        },
      ],
    },
  },
  'thymosin-alpha-1': {
    en: {
      heading: 'Why Thymosin Alpha-1 gets attention.',
      body: 'An immune-regulation peptide offers a more precise research question than the vague idea of simply “boosting” immunity.',
      cards: [
        {
          title: 'An immune coordinator',
          body: 'Thymosin Alpha-1 is studied for how it shapes communication among T cells, dendritic cells, and other parts of the immune response.',
        },
        {
          title: 'Regulation, not just activation',
          body: 'The research asks how immune responses are organized and balanced rather than assuming that more immune activity is always better.',
        },
        {
          title: 'A substantial but mixed history',
          body: 'Human research spans several conditions and has produced different results, making the specific population and endpoint especially important.',
        },
      ],
    },
    es: {
      heading: 'Por qué Thymosin Alpha-1 llama la atención.',
      body: 'Un péptido de regulación inmunitaria ofrece una pregunta más precisa que la vaga idea de simplemente “aumentar” la inmunidad.',
      cards: [
        {
          title: 'Un coordinador inmunitario',
          body: 'Thymosin Alpha-1 se estudia por cómo influye en la comunicación entre células T, células dendríticas y otras partes de la respuesta inmunitaria.',
        },
        {
          title: 'Regulación, no solo activación',
          body: 'La investigación pregunta cómo se organizan y equilibran las respuestas, sin asumir que más actividad inmunitaria siempre es mejor.',
        },
        {
          title: 'Una historia amplia pero mixta',
          body: 'La investigación humana abarca varias condiciones y ha producido resultados distintos, por lo que la población y el resultado medido importan especialmente.',
        },
      ],
    },
  },
  'pt-141': {
    en: {
      heading: 'Why PT-141 gets attention.',
      body: 'PT-141 approaches sexual-response research through brain signaling rather than beginning with blood flow.',
      cards: [
        {
          title: 'A brain-first pathway',
          body: 'PT-141, also known as bremelanotide, acts through melanocortin receptors involved in central desire and arousal signaling.',
        },
        {
          title: 'Different from blood-flow medicines',
          body: 'Its research path is distinct from compounds that primarily affect blood vessels, which is why it draws attention for desire-related questions.',
        },
        {
          title: 'A clearly defined human study group',
          body: 'Phase 3 trials focused on premenopausal women with acquired, generalized low sexual desire that caused personal distress.',
        },
      ],
    },
    es: {
      heading: 'Por qué PT-141 llama la atención.',
      body: 'PT-141 aborda la respuesta sexual mediante señales cerebrales en vez de comenzar con el flujo sanguíneo.',
      cards: [
        {
          title: 'Una vía que comienza en el cerebro',
          body: 'PT-141, también conocido como bremelanotida, actúa sobre receptores de melanocortina relacionados con señales centrales de deseo y excitación.',
        },
        {
          title: 'Diferente de medicamentos de flujo',
          body: 'Su ruta es distinta de compuestos que actúan principalmente en vasos sanguíneos, por eso atrae atención en preguntas relacionadas con deseo.',
        },
        {
          title: 'Un grupo humano claramente definido',
          body: 'Los ensayos fase 3 se enfocaron en mujeres premenopáusicas con deseo sexual bajo, adquirido y generalizado, que causaba malestar personal.',
        },
      ],
    },
  },
  semax: {
    en: {
      heading: 'Why Semax gets attention.',
      body: 'A neuroactive peptide connects learning, stress response, neurotrophin signals, and brain-injury research.',
      cards: [
        {
          title: 'The neurotrophin connection',
          body: 'Semax research follows signals such as BDNF and related gene activity involved in how brain cells adapt to challenge.',
        },
        {
          title: 'Why focus and memory enter the conversation',
          body: 'Learning and stress-response models examine attention, memory formation, and the brain’s response to demanding conditions.',
        },
        {
          title: 'Where the evidence stands',
          body: 'Modern accessible research is strongest in controlled brain models; dependable human focus or memory outcomes remain an open question.',
        },
      ],
    },
    es: {
      heading: 'Por qué Semax llama la atención.',
      body: 'Un péptido neuroactivo conecta aprendizaje, respuesta al estrés, señales de neurotrofinas e investigación de lesión cerebral.',
      cards: [
        {
          title: 'La conexión con neurotrofinas',
          body: 'La investigación de Semax sigue señales como BDNF y actividad genética relacionada con la adaptación de células cerebrales ante desafíos.',
        },
        {
          title: 'Por qué se habla de enfoque y memoria',
          body: 'Modelos de aprendizaje y estrés examinan atención, formación de memoria y respuesta cerebral ante condiciones exigentes.',
        },
        {
          title: 'Dónde se encuentra la evidencia',
          body: 'La investigación moderna accesible es más sólida en modelos cerebrales controlados; los resultados humanos confiables de enfoque o memoria siguen abiertos.',
        },
      ],
    },
  },
  selank: {
    en: {
      heading: 'Why Selank gets attention.',
      body: 'A tuftsin-derived peptide places stress response, calm-focus interest, and GABA-related signaling in the same research story.',
      cards: [
        {
          title: 'Built from an immune-related peptide',
          body: 'Selank was developed from a short tuftsin sequence, giving it a different starting point from conventional sedative compounds.',
        },
        {
          title: 'The GABA and stress connection',
          body: 'Laboratory research examines receptor and gene signals related to anxiety, stress adaptation, and inhibitory brain communication.',
        },
        {
          title: 'An early human signal',
          body: 'A small comparative study recorded anxiety-related changes, while the broader independent human evidence remains limited.',
        },
      ],
    },
    es: {
      heading: 'Por qué Selank llama la atención.',
      body: 'Un péptido derivado de tuftsin reúne respuesta al estrés, interés en enfoque tranquilo y señales relacionadas con GABA.',
      cards: [
        {
          title: 'Creado desde un péptido inmunitario',
          body: 'Selank se desarrolló a partir de una secuencia corta de tuftsin, con un punto de partida diferente al de compuestos sedantes convencionales.',
        },
        {
          title: 'La conexión con GABA y estrés',
          body: 'La investigación examina receptores y señales genéticas relacionadas con ansiedad, adaptación al estrés y comunicación cerebral inhibitoria.',
        },
        {
          title: 'Una señal humana inicial',
          body: 'Un pequeño estudio comparativo registró cambios relacionados con ansiedad, mientras la evidencia humana independiente más amplia sigue limitada.',
        },
      ],
    },
  },
  'bac-water': {
    en: {
      heading: 'What makes BAC Water useful in a laboratory workflow.',
      body: 'This is a preparation accessory, so the important questions are preservation, labeling, and product-specific compatibility.',
      cards: [
        {
          title: 'Sterile water with a preservative',
          body: 'Bacteriostatic water contains benzyl alcohol to limit bacterial growth after the container has been entered.',
        },
        {
          title: 'Built for organized preparation',
          body: 'The 10 mL format supports documented laboratory workflows where a compatible preserved diluent is specifically required.',
        },
        {
          title: 'Compatibility comes first',
          body: 'BAC Water is not universal. The relevant product documentation must support the diluent, concentration, storage, and handling conditions.',
        },
      ],
    },
    es: {
      heading: 'Qué hace útil a BAC Water en un flujo de laboratorio.',
      body: 'Es un accesorio de preparación, por lo que importan la conservación, el etiquetado y la compatibilidad específica.',
      cards: [
        {
          title: 'Agua estéril con conservante',
          body: 'El agua bacteriostática contiene alcohol bencílico para limitar el crecimiento bacteriano después de abrir el recipiente.',
        },
        {
          title: 'Diseñada para preparación organizada',
          body: 'El formato de 10 mL apoya flujos documentados donde se requiere específicamente un diluyente conservado y compatible.',
        },
        {
          title: 'La compatibilidad es lo primero',
          body: 'BAC Water no es universal. La documentación del producto debe respaldar diluyente, concentración, almacenamiento y condiciones de manejo.',
        },
      ],
    },
  },
} satisfies Record<NonRetatrutideProductSlug, LocalizedHighlightCore>

const sharedHighlightCopy = {
  en: {
    eyebrow: 'Why it stands out',
    context: 'These highlights summarize published research themes—not guaranteed personal results. Encore products are for research use only.',
  },
  es: {
    eyebrow: 'Por qué se distingue',
    context: 'Estos puntos resumen temas de investigación publicados, no resultados personales garantizados. Los productos Encore son solo para investigación.',
  },
} as const

export const productTrendCards = Object.fromEntries(
  (Object.keys(productHighlightContent) as NonRetatrutideProductSlug[]).map((slug) => [slug, {
    en: productHighlightContent[slug].en.cards,
    es: productHighlightContent[slug].es.cards,
  }]),
) as unknown as Record<NonRetatrutideProductSlug, LocalizedTrendCards>

export function getProductTrendContent(
  slug: NonRetatrutideProductSlug,
  locale: Locale,
): ProductTrendContent {
  return {
    eyebrow: sharedHighlightCopy[locale].eyebrow,
    ...productHighlightContent[slug][locale],
    context: sharedHighlightCopy[locale].context,
  }
}
