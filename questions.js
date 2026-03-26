/**
 * questions.js — Banco de Perguntas Educacionais Expandido
 * 60+ perguntas sobre Mitose, Meiose e Divisão Celular
 */

const QUESTIONS = {
  1: [ // Nível 1: Mitose
    {
      id: 'm1',
      type: 'order',
      text: 'Ordene as fases da mitose na sequência correta:',
      sequence: ['Prófase', 'Metáfase', 'Anáfase', 'Telófase'],
      explanation: 'Sequência correta: Prófase → Metáfase → Anáfase → Telófase'
    },
    {
      id: 'm2',
      type: 'multiple',
      text: 'O que acontece na Prófase?',
      options: [
        'Os cromossomos se condensam e o fuso mitótico se forma',
        'Os cromossomos se alinham no centro da célula',
        'Os cromossomos se separam para os polos',
        'A célula se divide em duas'
      ],
      answer: 0,
      explanation: 'Na Prófase, os cromossomos se condensam e o fuso mitótico começa a se formar.'
    },
    {
      id: 'm3',
      type: 'multiple',
      text: 'O que ocorre na Metáfase?',
      options: [
        'Os cromossomos se condensam',
        'Os cromossomos ficam alinhados no centro da célula',
        'Os cromossomos se separam para os polos',
        'O núcleo se desintegra'
      ],
      answer: 1,
      explanation: 'Na Metáfase, os cromossomos se alinham no equador da célula (placa metafásica).'
    },
    {
      id: 'm4',
      type: 'multiple',
      text: 'O que caracteriza a Anáfase?',
      options: [
        'Os cromossomos se condensam',
        'Os cromossomos se alinham no centro',
        'As cromátides se separam e migram para os polos da célula',
        'O núcleo se reconstrói'
      ],
      answer: 2,
      explanation: 'Na Anáfase, as cromátides se separam e são puxadas para os polos opostos da célula pelo fuso mitótico.'
    },
    {
      id: 'm5',
      type: 'multiple',
      text: 'O que acontece na Telófase?',
      options: [
        'Os cromossomos se condensam',
        'Os cromossomos se alinham no centro',
        'Os cromossomos descondensam e os núcleos se reconstroem',
        'A célula se divide em quatro'
      ],
      answer: 2,
      explanation: 'Na Telófase, os cromossomos descondensam, os núcleos se reconstroem e inicia-se a citocinese.'
    },
    {
      id: 'm6',
      type: 'multiple',
      text: 'Qual é o principal objetivo da mitose?',
      options: [
        'Produzir gametas',
        'Crescimento e regeneração de tecidos',
        'Reduzir o número de cromossomos',
        'Criar variabilidade genética'
      ],
      answer: 1,
      explanation: 'A mitose é responsável pelo crescimento, regeneração e manutenção dos tecidos do corpo.'
    },
    {
      id: 'm7',
      type: 'multiple',
      text: 'Quantas células são formadas ao final da mitose?',
      options: [
        'Uma célula',
        'Duas células idênticas',
        'Três células',
        'Quatro células'
      ],
      answer: 1,
      explanation: 'A mitose resulta em duas células-filhas geneticamente idênticas à célula-mãe.'
    },
    {
      id: 'm8',
      type: 'truefalse',
      text: 'As células formadas na mitose são geneticamente iguais à célula original.',
      answer: true,
      explanation: 'Verdadeiro! A mitose produz cópias exatas da célula-mãe.'
    },
    {
      id: 'm9',
      type: 'truefalse',
      text: 'A mitose ocorre em células haploides.',
      answer: false,
      explanation: 'Falso! A mitose ocorre em células diploides (2n).'
    },
    {
      id: 'm10',
      type: 'multiple',
      text: 'Em qual fase os cromossomos estão mais condensados?',
      options: [
        'Interfase',
        'Prófase e Metáfase',
        'Anáfase',
        'Telófase'
      ],
      answer: 1,
      explanation: 'Os cromossomos estão mais condensados durante a Prófase e Metáfase.'
    },
    {
      id: 'm11',
      type: 'multiple',
      text: 'O que é o fuso mitótico?',
      options: [
        'Uma estrutura de proteína que puxa os cromossomos',
        'Um tipo de cromossomo',
        'A membrana nuclear',
        'Um organelo celular'
      ],
      answer: 0,
      explanation: 'O fuso mitótico é uma estrutura de microtúbulos que puxa os cromossomos para os polos da célula.'
    },
    {
      id: 'm12',
      type: 'truefalse',
      text: 'A Interfase é considerada parte da mitose.',
      answer: false,
      explanation: 'Falso! A Interfase é o período entre divisões, não faz parte da mitose.'
    },
    {
      id: 'm13',
      type: 'multiple',
      text: 'Quantos cromossomos uma célula humana tem após a mitose?',
      options: [
        '23 cromossomos',
        '46 cromossomos',
        '92 cromossomos',
        '69 cromossomos'
      ],
      answer: 1,
      explanation: 'Cada célula-filha tem 46 cromossomos, igual à célula-mãe.'
    },
    {
      id: 'm14',
      type: 'multiple',
      text: 'Em qual fase ocorre a separação das cromátides?',
      options: [
        'Prófase',
        'Metáfase',
        'Anáfase',
        'Telófase'
      ],
      answer: 2,
      explanation: 'Na Anáfase, as cromátides se separam no centrômero e migram para os polos.'
    },
    {
      id: 'm15',
      type: 'truefalse',
      text: 'A citocinese é o mesmo que mitose.',
      answer: false,
      explanation: 'Falso! A citocinese é a divisão do citoplasma, que ocorre após a mitose.'
    },
    {
      id: 'm16',
      type: 'multiple',
      text: 'O que é a cromatina?',
      options: [
        'O material genético descondensado no núcleo',
        'Um tipo de cromossomo',
        'A membrana nuclear',
        'O fuso mitótico'
      ],
      answer: 0,
      explanation: 'A cromatina é o DNA descondensado durante a Interfase. Ela se condensa em cromossomos durante a mitose.'
    },
    {
      id: 'm17',
      type: 'multiple',
      text: 'Qual é a função da Interfase?',
      options: [
        'Dividir a célula',
        'Preparar a célula para a divisão (crescimento e replicação de DNA)',
        'Produzir gametas',
        'Destruir organelos'
      ],
      answer: 1,
      explanation: 'A Interfase é quando a célula cresce, replica seu DNA e se prepara para a divisão.'
    },
    {
      id: 'm18',
      type: 'truefalse',
      text: 'O centrômero é a região onde as cromátides se unem.',
      answer: true,
      explanation: 'Verdadeiro! O centrômero é o ponto de constrição onde as duas cromátides se unem.'
    },
    {
      id: 'm19',
      type: 'multiple',
      text: 'Quantas cromátides tem um cromossomo após a replicação?',
      options: [
        'Uma cromátide',
        'Duas cromátides',
        'Três cromátides',
        'Quatro cromátides'
      ],
      answer: 1,
      explanation: 'Após a replicação, um cromossomo consiste em duas cromátides idênticas unidas pelo centrômero.'
    },
    {
      id: 'm20',
      type: 'multiple',
      text: 'O que é a placa metafásica?',
      options: [
        'A região onde os cromossomos se alinham durante a metáfase',
        'Uma estrutura que divide a célula',
        'O fuso mitótico',
        'A membrana nuclear'
      ],
      answer: 0,
      explanation: 'A placa metafásica é o alinhamento dos cromossomos no plano equatorial da célula durante a metáfase.'
    }
  ],

  2: [ // Nível 2: Meiose
    {
      id: 'me1',
      type: 'multiple',
      text: 'Qual é a principal função da meiose?',
      options: [
        'Crescimento celular',
        'Produzir gametas com metade dos cromossomos',
        'Regeneração de tecidos',
        'Manutenção do corpo'
      ],
      answer: 1,
      explanation: 'A meiose produz gametas (espermatozoides e óvulos) com metade dos cromossomos (haploides).'
    },
    {
      id: 'me2',
      type: 'multiple',
      text: 'Quantas divisões celulares ocorrem na meiose?',
      options: [
        'Uma divisão',
        'Duas divisões',
        'Três divisões',
        'Quatro divisões'
      ],
      answer: 1,
      explanation: 'A meiose envolve duas divisões: Meiose I e Meiose II.'
    },
    {
      id: 'me3',
      type: 'multiple',
      text: 'Quantas células são formadas ao final da meiose?',
      options: [
        'Uma célula',
        'Duas células',
        'Três células',
        'Quatro células'
      ],
      answer: 3,
      explanation: 'A meiose resulta em quatro células haploides (n).'
    },
    {
      id: 'me4',
      type: 'multiple',
      text: 'O que é crossing-over?',
      options: [
        'A separação dos cromossomos',
        'A troca de segmentos entre cromossomos homólogos',
        'A divisão do citoplasma',
        'A condensação dos cromossomos'
      ],
      answer: 1,
      explanation: 'Crossing-over é a troca de material genético entre cromossomos homólogos.'
    },
    {
      id: 'me5',
      type: 'multiple',
      text: 'Em qual fase ocorre o crossing-over?',
      options: [
        'Prófase I',
        'Metáfase I',
        'Anáfase I',
        'Telófase I'
      ],
      answer: 0,
      explanation: 'O crossing-over ocorre durante a Prófase I da meiose.'
    },
    {
      id: 'me6',
      type: 'multiple',
      text: 'Qual a diferença entre Meiose I e Meiose II?',
      options: [
        'Meiose I é mais rápida',
        'Meiose I separa cromossomos homólogos; Meiose II separa cromátides',
        'Meiose II não produz células',
        'Não há diferença'
      ],
      answer: 1,
      explanation: 'Meiose I reduz o número de cromossomos; Meiose II separa as cromátides como na mitose.'
    },
    {
      id: 'me7',
      type: 'multiple',
      text: 'As células formadas na meiose são haploides ou diploides?',
      options: [
        'Diploides (2n)',
        'Haploides (n)',
        'Triploides (3n)',
        'Poliploides'
      ],
      answer: 1,
      explanation: 'As células formadas na meiose são haploides (n), com metade dos cromossomos.'
    },
    {
      id: 'me8',
      type: 'truefalse',
      text: 'A meiose ocorre em células somáticas.',
      answer: false,
      explanation: 'Falso! A meiose ocorre apenas em células germinativas (óvulos e espermatozoides).'
    },
    {
      id: 'me9',
      type: 'truefalse',
      text: 'O crossing-over aumenta a variabilidade genética.',
      answer: true,
      explanation: 'Verdadeiro! O crossing-over cria novas combinações genéticas.'
    },
    {
      id: 'me10',
      type: 'multiple',
      text: 'O que são cromossomos homólogos?',
      options: [
        'Cromossomos idênticos',
        'Cromossomos que vêm um do pai e outro da mãe',
        'Cromossomos sexuais',
        'Cromossomos mutantes'
      ],
      answer: 1,
      explanation: 'Cromossomos homólogos são pares de cromossomos, um de cada progenitor.'
    },
    {
      id: 'me11',
      type: 'multiple',
      text: 'Em qual fase da meiose os cromossomos homólogos se separam?',
      options: [
        'Prófase I',
        'Metáfase I',
        'Anáfase I',
        'Telófase I'
      ],
      answer: 2,
      explanation: 'Na Anáfase I, os cromossomos homólogos se separam e vão para polos opostos.'
    },
    {
      id: 'me12',
      type: 'truefalse',
      text: 'Após a Meiose I, as células são diploides.',
      answer: false,
      explanation: 'Falso! Após a Meiose I, as células são haploides (n).'
    },
    {
      id: 'me13',
      type: 'multiple',
      text: 'Qual é o resultado da fecundação?',
      options: [
        'Uma célula haploide',
        'Duas células haploides',
        'Uma célula diploide',
        'Quatro células haploides'
      ],
      answer: 2,
      explanation: 'A fecundação une dois gametas haploides, formando uma célula diploide (zigoto).'
    },
    {
      id: 'me14',
      type: 'multiple',
      text: 'Por que a meiose é importante para a reprodução?',
      options: [
        'Aumenta o tamanho das células',
        'Produz gametas com metade dos cromossomos',
        'Regenera tecidos',
        'Cria variabilidade genética apenas'
      ],
      answer: 1,
      explanation: 'A meiose é essencial para produzir gametas com metade dos cromossomos, mantendo a estabilidade cromossômica.'
    },
    {
      id: 'me15',
      type: 'truefalse',
      text: 'A meiose produz células geneticamente idênticas.',
      answer: false,
      explanation: 'Falso! A meiose produz células geneticamente diferentes devido ao crossing-over e segregação.'
    },
    {
      id: 'me16',
      type: 'multiple',
      text: 'O que é segregação independente?',
      options: [
        'A separação de cromátides',
        'A distribuição aleatória de cromossomos homólogos nas células-filhas',
        'O crossing-over',
        'A citocinese'
      ],
      answer: 1,
      explanation: 'Segregação independente é a distribuição aleatória de cromossomos homólogos, aumentando variabilidade.'
    },
    {
      id: 'me17',
      type: 'truefalse',
      text: 'Em humanos, os gametas têm 23 cromossomos.',
      answer: true,
      explanation: 'Verdadeiro! Gametas humanos são haploides com 23 cromossomos.'
    },
    {
      id: 'me18',
      type: 'multiple',
      text: 'Qual é a importância do crossing-over?',
      options: [
        'Aumentar o tamanho das células',
        'Criar variabilidade genética',
        'Dividir a célula',
        'Replicar o DNA'
      ],
      answer: 1,
      explanation: 'O crossing-over cria novas combinações genéticas, aumentando a variabilidade na população.'
    },
    {
      id: 'me19',
      type: 'truefalse',
      text: 'A Meiose II é similar à mitose.',
      answer: true,
      explanation: 'Verdadeiro! Meiose II é uma divisão equacional como a mitose.'
    },
    {
      id: 'me20',
      type: 'multiple',
      text: 'Quantos gametas são produzidos a partir de uma célula-mãe?',
      options: [
        '1 gameta',
        '2 gametas',
        '3 gametas',
        '4 gametas'
      ],
      answer: 3,
      explanation: 'Uma célula diploide produz 4 gametas haploides através da meiose.'
    }
  ],

  3: [ // Nível 3: Verdadeiro/Falso
    {
      id: 'v1',
      type: 'truefalse',
      text: 'A fase G1 é responsável pelo crescimento da célula.',
      answer: true,
      explanation: 'Verdadeiro! Em G1, a célula cresce e se prepara para a replicação do DNA.'
    },
    {
      id: 'v2',
      type: 'truefalse',
      text: 'Na fase G2, a célula já se divide em duas.',
      answer: false,
      explanation: 'Falso! G2 é preparação para a mitose, não é divisão.'
    },
    {
      id: 'v3',
      type: 'truefalse',
      text: 'A mitose é o processo de divisão celular que produz duas células idênticas.',
      answer: true,
      explanation: 'Verdadeiro! A mitose produz duas células-filhas geneticamente idênticas.'
    },
    {
      id: 'v4',
      type: 'truefalse',
      text: 'Na Prófase, os cromossomos começam a se condensar.',
      answer: true,
      explanation: 'Verdadeiro! Na Prófase, os cromossomos se condensam e ficam visíveis.'
    },
    {
      id: 'v5',
      type: 'truefalse',
      text: 'Na Metáfase, os cromossomos ficam alinhados no centro da célula.',
      answer: true,
      explanation: 'Verdadeiro! Na Metáfase, os cromossomos se alinham na placa metafásica.'
    },
    {
      id: 'v6',
      type: 'truefalse',
      text: 'Na Anáfase, os cromossomos se duplicam.',
      answer: false,
      explanation: 'Falso! Na Anáfase, as cromátides se separam (não se duplicam).'
    },
    {
      id: 'v7',
      type: 'truefalse',
      text: 'Na Telófase, duas novas células começam a se formar.',
      answer: true,
      explanation: 'Verdadeiro! Na Telófase, inicia-se a citocinese, dividindo a célula.'
    },
    {
      id: 'v8',
      type: 'truefalse',
      text: 'A mitose resulta em duas células diferentes da original.',
      answer: false,
      explanation: 'Falso! A mitose resulta em duas células idênticas à original.'
    },
    {
      id: 'v9',
      type: 'truefalse',
      text: 'O ciclo celular inclui G1, G2 e mitose.',
      answer: true,
      explanation: 'Verdadeiro! O ciclo celular completo inclui essas fases (e também S).'
    },
    {
      id: 'v10',
      type: 'truefalse',
      text: 'A mitose ajuda no crescimento e regeneração de tecidos.',
      answer: true,
      explanation: 'Verdadeiro! A mitose é fundamental para o crescimento e regeneração.'
    },
    {
      id: 'v11',
      type: 'truefalse',
      text: 'A meiose produz quatro células haploides.',
      answer: true,
      explanation: 'Verdadeiro! A meiose resulta em quatro células com metade dos cromossomos.'
    },
    {
      id: 'v12',
      type: 'truefalse',
      text: 'O DNA se replica durante a fase S.',
      answer: true,
      explanation: 'Verdadeiro! A fase S é quando o DNA se duplica.'
    },
    {
      id: 'v13',
      type: 'truefalse',
      text: 'Gametas são células diploides.',
      answer: false,
      explanation: 'Falso! Gametas são haploides (n).'
    },
    {
      id: 'v14',
      type: 'truefalse',
      text: 'O crossing-over ocorre na meiose.',
      answer: true,
      explanation: 'Verdadeiro! O crossing-over é um evento importante da meiose.'
    },
    {
      id: 'v15',
      type: 'truefalse',
      text: 'Células somáticas sofrem meiose.',
      answer: false,
      explanation: 'Falso! Apenas células germinativas sofrem meiose.'
    },
    {
      id: 'v16',
      type: 'truefalse',
      text: 'O fuso mitótico é formado por microtúbulos.',
      answer: true,
      explanation: 'Verdadeiro! O fuso mitótico é uma estrutura de microtúbulos.'
    },
    {
      id: 'v17',
      type: 'truefalse',
      text: 'A Interfase é a fase mais longa do ciclo celular.',
      answer: true,
      explanation: 'Verdadeiro! A Interfase dura cerca de 90% do ciclo celular.'
    },
    {
      id: 'v18',
      type: 'truefalse',
      text: 'Cromossomos homólogos se separam na mitose.',
      answer: false,
      explanation: 'Falso! Cromossomos homólogos se separam na meiose I.'
    },
    {
      id: 'v19',
      type: 'truefalse',
      text: 'A citocinese é a divisão do citoplasma.',
      answer: true,
      explanation: 'Verdadeiro! A citocinese divide o citoplasma em duas células.'
    },
    {
      id: 'v20',
      type: 'truefalse',
      text: 'Humanos têm 23 pares de cromossomos.',
      answer: true,
      explanation: 'Verdadeiro! Humanos têm 46 cromossomos (23 pares).'
    }
  ]
};
