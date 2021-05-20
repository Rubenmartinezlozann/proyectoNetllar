<?php

namespace App\Repository;

use App\Entity\Address;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @method Address|null find($id, $lockMode = null, $lockVersion = null)
 * @method Address|null findOneBy(array $criteria, array $orderBy = null)
 * @method Address[]    findAll()
 * @method Address[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AddressRepository extends ServiceEntityRepository
{
    private $manager;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $manager)
    {
        parent::__construct($registry, Address::class);
        $this->manager = $manager;
    }

    public function getAllAddress($cp)
    {
        $qb = $this->manager->createQueryBuilder('a')
            ->select('a.cp', 'a.provincia', 'a.municipio', 'a.tipovia', 'a.calle')
            ->from(Address::class, 'a');

        if (!empty($cp)) {
            $qb = $qb->where('a.cp = :cp')
                ->setParameter('cp', $cp);
        }

        $qb = $qb->groupBy('a.calle')
            ->addOrderBy('a.provincia', 'ASC')
            ->addOrderBy('a.municipio', 'ASC')
            ->addOrderBy('a.tipovia', 'ASC')
            ->addOrderBy('a.calle', 'ASC')
            ->getQuery();

        return $qb->getResult();
    }

    public function getOneAddressByText($addressText, $number, $cp = null)
    {
        $dbAddressData = $this->findBy(['cp' => $cp, 'numero' => $number]);
        $words = $this->getWords($addressText);
        $sequencesArray = ['typeRoad', 'street', 'township', 'province'];

        $lenghtSequencesArray = $this->getWordsLenghtSequences($words, $sequencesArray);
        return $this->getSuggestedAddress($lenghtSequencesArray, $words, $dbAddressData);
    }

    private function getWords($text)
    {
        $address = [];
        $substringStart = 0;
        $isStartSet = false;
        for ($i = 0; $i < strlen($text); $i++) {
            if ((substr($text, $i, 1) === ' ' || substr($text, $i, 1) === ',') && $isStartSet) {
                $address[] = substr($text, $substringStart, $i - $substringStart);
                $isStartSet = false;
                $substringStart = null;
            } elseif (substr($text, $i, 1) !== ' ' && substr($text, $i, 1) !== ',' && !$isStartSet) {
                $substringStart = $i;
                $isStartSet = true;
            }
        }
        $isStartSet ? $address[] = substr($text, $substringStart, strlen($text) - $substringStart) : true;
        return $address;
    }

    private function getWordsLenghtSequences($words, $wordsOrder)
    {
        $wordsCombinations = [];
        for ($words1 = count($words); $words1 >= 0; $words1--) {
            for ($words2 = count($words); $words2 >= 0; $words2--) {
                for ($words3 = count($words); $words3 >= 0; $words3--) {
                    for ($words4 = count($words); $words4  >= 0; $words4--) {
                        $sum = $words1 + $words2 + $words3 + $words4;
                        if (count($words) === $sum && $words1 !== 0 && $words2 !== 0 && $words3 !== 0 && $words4 !== 0)
                            $wordsCombinations[] = [$wordsOrder[0] => $words1, $wordsOrder[1] => $words2, $wordsOrder[2] => $words3, $wordsOrder[3] => $words4];
                    }
                }
            }
        }

        return $wordsCombinations;
    }

    private function getSuggestedAddress($combinations, $words, $dbData)
    {
        $data = [];
        foreach ($combinations as $combination) {
            $combinationData = [
                'province' => '',
                'township' => '',
                'typeRoad' => '',
                'street' => ''
            ];

            $wordsIndex = 0;
            foreach ($combination as $key => $elem) {
                for ($i = 0; $i < $elem; $i++) {
                    if ($combinationData[$key] !== '') $combinationData[$key] .= ' ';
                    $combinationData[$key] .= $words[$i + $wordsIndex];
                }
                $wordsIndex += $i;
            }
            foreach ($dbData as $value) {
                if ($value->getProvincia() === $combinationData['province'] && $value->getMunicipio() === $combinationData['township'] && $value->getTipovia() === $combinationData['typeRoad'] && $value->getCalle() === $combinationData['street'])
                    $data[] = [
                        'cp' => $value->getCp(),
                        'provincia' => $value->getProvincia(),
                        'municipio' => $value->getMunicipio(),
                        'tipovia' => $value->getTipovia(),
                        'calle' => $value->getCalle(),
                        'producto' => $value->getProducto()
                    ];
            }
        }

        return $data;
    }

    private function getAddressByFilter($province, $township, $typeRoad, $street, $number, $cp = null)
    {
        $qb = $this->manager->createQueryBuilder('a')
            ->select('a.cp', 'a.provincia', 'a.municipio', 'a.tipovia', 'a.calle', 'a.numero', 'a.producto')
            ->from(Address::class, 'a')
            ->where('a.provincia = :provincia')
            ->andWhere('a.municipio = :municipio')
            ->andWhere('a.tipovia = :tipovia')
            ->andWhere('a.calle = :calle')
            ->andWhere('a.numero = :numero')
            ->setParameter('provincia', $province)
            ->setParameter('municipio', $township)
            ->setParameter('tipovia', $typeRoad)
            ->setParameter('calle', $street)
            ->setParameter('numero', $number);

        if (!empty($cp)) {
            $qb = $qb->andWhere('a.cp = :cp')
                ->setParameter('cp', $cp);
        }

        $qb = $qb
            ->getQuery();

        return $qb->getResult();
    }

    // public function getAddressByCp($cp)
    // {
    //     $address = $this->findBy(['cp' => $cp]);

    //     if (count($address) === 1) {
    //         $address = $this->findBy(['cp' => $cp, 'provincia' => $address[0]->getProvincia()]);
    //         if (count($address) === 1) {
    //             $address = $this->findBy(['cp' => $cp, 'provincia' => $address[0]->getProvincia(), 'municipio' => $address[0]->getMunicipio()]);
    //             if (count($address) === 1) {
    //                 $address = $this->findBy(['cp' => $cp, 'provincia' => $address[0]->getProvincia(), 'municipio' => $address[0]->getMunicipio(), 'tipovia' => $address[0]->getTipovia()]);
    //             }
    //         }
    //     }

    //     $data = [];
    //     foreach ($address as $value) {
    //         $data[] = [
    //             'province' => $value->getProvincia(),
    //             'township' => $value->getMunicipio()
    //         ];
    //     }
    //     return $data;
    // }

    /* public function suggestAddress($addressText, $cp = null)
    {
        $dbAddressData = $cp === null ? $this->findAll() : $this->findBy(['cp' => $cp]);
        $words = $this->getWords($addressText);
        $sequencesArray = $this->getWordsSequences();
        $lenghtSequencesArray = $this->getWordsLenghtSequences($words, $dbAddressData, $sequencesArray);
        return $this->getSuggestedAddress($lenghtSequencesArray, $words, $dbAddressData);
    }

    private function getWords($text)
    {
        $address = [];
        $substringStart = 0;
        $isStartSet = false;
        for ($i = 0; $i < strlen($text); $i++) {
            if ((substr($text, $i, 1) === ' ' || substr($text, $i, 1) === ',') && $isStartSet) {
                $address[] = substr($text, $substringStart, $i - $substringStart);
                $isStartSet = false;
                $substringStart = null;
            } elseif (substr($text, $i, 1) !== ' ' && substr($text, $i, 1) !== ',' && !$isStartSet) {
                $substringStart = $i;
                $isStartSet = true;
            }
        }
        $isStartSet ? $address[] = substr($text, $substringStart, strlen($text) - $substringStart) : true;
        return $address;
    }

    private function getWordsSequences()
    {
        $wordsOrder = [];
        $wordsSort = ['street', 'province', 'township', 'typeRoad'];
        foreach ($wordsSort as $frist) {
            foreach ($wordsSort as $second) {
                if ($frist !== $second) {
                    foreach ($wordsSort as $third) {
                        if ($second !== $third && $third !== $frist) {
                            foreach ($wordsSort as $fourth) {
                                if ($fourth !== $frist && $fourth !== $second && $fourth !== $third) {
                                    $wordsOrder[] = [$frist, $second, $third, $fourth];
                                }
                            }
                        }
                    }
                }
            }
        }
        return $wordsOrder;
    }

    private function getWordsLenghtSequences($words, $addressData, $wordsSequences)
    {
        $maxWords = $this->getMaxWordsNumber($addressData, count($words));
        $wordsCombinations = [];
        foreach ($wordsSequences as $wordSequence) {
            for ($words1 = $maxWords[$wordSequence[0]]; $words1 >= 0; $words1--) {
                for ($words2 = $maxWords[$wordSequence[1]]; $words2 >= 0; $words2--) {
                    for ($words3 = $maxWords[$wordSequence[2]]; $words3 >= 0; $words3--) {
                        for ($words4 = $maxWords[$wordSequence[3]]; $words4  >= 0; $words4--) {
                            $sum = $words1 + $words2 + $words3 + $words4;
                            if (count($words) === $sum) {
                                $wordsCombinations[] = [$wordSequence[0] => $words1, $wordSequence[1] => $words2, $wordSequence[2] => $words3, $wordSequence[3] => $words4];
                            }
                        }
                    }
                }
            }
        }
        return $wordsCombinations;
    }

    private function getMaxWordsNumber($data, $maxValue)
    {
        $maxWords = [
            'province' => 0,
            'township' => 0,
            'typeRoad' => 0,
            'street' => 0
        ];

        foreach ($data as $value) {
            $countWords = [
                'province' => count($this->getWords($value->getProvincia())),
                'township' => count($this->getWords($value->getMunicipio())),
                'typeRoad' => count($this->getWords($value->getTipovia())),
                'street' => count($this->getWords($value->getCalle()))
            ];

            $maxWords['province'] = $countWords['province'] > $maxWords['province'] ? ($countWords['province'] <= $maxValue ? $countWords['province'] : $maxValue) : $maxWords['province'];
            $maxWords['township'] = $countWords['township'] > $maxWords['township'] ? ($countWords['township'] <= $maxValue ? $countWords['township'] : $maxValue) : $maxWords['township'];
            $maxWords['typeRoad'] = ($countWords['typeRoad'] > $maxWords['typeRoad'] ? ($countWords['typeRoad'] <= $maxValue ? $countWords['typeRoad'] : $maxValue) : $maxWords['typeRoad']);
            $maxWords['street'] = $countWords['street'] > $maxWords['street'] ? ($countWords['street'] <= $maxValue ? $countWords['street'] : $maxValue) : $maxWords['street'];
        }

        return $maxWords;
    }

    private function getSuggestedAddress($combinations, $words, $dbAddressData)
    {
        $data = [];
        foreach ($combinations as $combination) {
            $sugestedValue = $combination;
            $index = 0;
            foreach ($combination as $key => $value) {
                $text = '';
                for ($i = $index; $i < $value + $index; $i++) {
                    $text .= $words[$i] . ' ';
                }
                $text = substr($text, 0, strlen($text) - 1);
                $index = $i;
                $sugestedValue[$key] = $text !== null ? $text : '';
            }

            $lastValue = '';
            foreach ($dbAddressData as $dbValue) {
                if ($lastValue !== [$dbValue->getTipovia(), $dbValue->getCalle(), $dbValue->getMunicipio(), $dbValue->getProvincia()] && str_contains(strtolower($dbValue->getProvincia()), strtolower($sugestedValue['province'])) && str_contains(strtolower($dbValue->getMunicipio()), strtolower($sugestedValue['township'])) && str_contains(strtolower($dbValue->getTipovia()), strtolower($sugestedValue['typeRoad'])) && str_contains(strtolower($dbValue->getCalle()), strtolower($sugestedValue['street']))) {
                    $duplicated = false;

                    $nextValue = [
                        'typeRoad' => strtoupper(substr($dbValue->getTipovia(), 0, 1)) . strtolower(substr($dbValue->getTipovia(), 1)),
                        'street' => strtoupper(substr($dbValue->getCalle(), 0, 1)) . strtolower(substr($dbValue->getCalle(), 1)),
                        'township' => strtoupper(substr($dbValue->getMunicipio(), 0, 1)) . strtolower(substr($dbValue->getMunicipio(), 1)),
                        'province' => strtoupper(substr($dbValue->getProvincia(), 0, 1)) . strtolower(substr($dbValue->getProvincia(), 1)),
                        'cp' => $dbValue->getCp()
                    ];

                    foreach ($data as $key => $value) {
                        if ($value == $nextValue) {
                            $duplicated = true;
                        }
                    }

                    if (!$duplicated) {
                        $data[] = $nextValue;
                    }
                }
                $lastValue = [$dbValue->getTipovia(), $dbValue->getCalle(), $dbValue->getMunicipio(), $dbValue->getProvincia()];
            }
        }
        return $data;
    } */

    /* private function executeNativeQuery($text, $params = [])
    {
        $rsm = new ResultSetMapping();
        $query = $this->manager->createNativeQuery($text, $rsm);
        for ($i = 0; $i < count($params); $i++) {
            $query->setParameter($i, $params = [$i]);
        }

        return $query->getResult();
    } */

    /* return $this->createQueryBuilder('a')
            ->select('a.provincia, a.municipio, a.tipovia, a.calle')
            ->andWhere('a.provincia like %:prov')
            ->andWhere('a.municipio like %:mun')
            ->andWhere('a.tipovia like %:typ')
            ->andWhere('a.calle like %:street')
            ->setParameter('prov', $province)
            ->setParameter('mun', $township)
            ->setParameter('typ', $typeRoad)
            ->setParameter('street', $street)
            ->orderBy('a.Calle', 'ASC')
            ->setMaxResults(6)
            ->getQuery()
            ->getResult(); */

    /* public function findOneBySomeField($value): ?Address
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult();
    } */
}
    // public function getProvinces($cp)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.provincia')
    //         ->from(Address::class, 'a');


    //     if (!empty($cp)) {
    //         $qb = $qb
    //             ->where('a.cp = :cp')
    //             ->setParameter('cp', $cp);
    //     }

    //     return $qb
    //         ->orderBy('a.provincia', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }

    // public function getCp($province, $township, $typeRoad, $street, $number)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.cp')
    //         ->from(Address::class, 'a');
    //     if ($province !== null) {
    //         $qb = $qb
    //             ->andWhere('a.provincia = :province')
    //             ->setParameter('province', $province);
    //         if ($township !== null) {
    //             $qb = $qb
    //                 ->andWhere('a.municipio = :township')
    //                 ->setParameter('township', $township);
    //             if ($typeRoad !== null) {
    //                 $qb = $qb
    //                     ->andWhere('a.tipovia = :typeRoad')
    //                     ->setParameter('typeRoad', $typeRoad);
    //                 if ($street !== null) {
    //                     $qb = $qb
    //                         ->andWhere('a.calle = :street')
    //                         ->setParameter('street', $street);
    //                     if ($number !== null) {
    //                         $qb = $qb
    //                             ->andWhere('a.numero = :number')
    //                             ->setParameter('number', $number);
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return $qb
    //         ->orderBy('a.cp', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }

    // public function getTownship($province, $cp)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.municipio')
    //         ->from(Address::class, 'a')
    //         ->Where('a.provincia = :province')
    //         ->setParameter('province', $province);
    //     if ($cp !== null) {
    //         $qb = $qb
    //             ->andWhere('a.cp = :cp')
    //             ->setParameter('cp', $cp);
    //     }

    //     return $qb
    //         ->orderBy('a.municipio', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }

    // public function getStreet($province, $township, $typeRoad, $cp)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.calle')
    //         ->from(Address::class, 'a')
    //         ->Where('a.provincia = :province AND a.municipio = :township')
    //         ->setParameter('province', $province)
    //         ->setParameter('township', $township);

    //     if ($typeRoad !== null) {
    //         $qb = $qb
    //             ->andWhere('a.tipovia = :typeRoad')
    //             ->setParameter('typeRoad', $typeRoad);
    //     }

    //     if ($cp !== null) {
    //         $qb = $qb
    //             ->andWhere('a.cp = :cp')
    //             ->setParameter('cp', $cp);
    //     }

    //     return $qb
    //         ->orderBy('a.calle', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }

    // public function getTypeRoad($province, $township, $street, $cp)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.tipovia')
    //         ->from(Address::class, 'a')
    //         ->Where('a.provincia = :province AND a.municipio = :township')
    //         ->setParameter('province', $province)
    //         ->setParameter('township', $township);

    //     if ($street !== null) {
    //         $qb = $qb
    //             ->andWhere('a.calle = :street')
    //             ->setParameter('street', $street);
    //     }

    //     if ($cp !== null) {
    //         $qb = $qb
    //             ->andWhere('a.cp = :cp')
    //             ->setParameter('cp', $cp);
    //     }

    //     return $qb
    //         ->orderBy('a.tipovia', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }

    // public function getNumber($province, $township, $street, $typeRoad, $cp)
    // {
    //     $qb = $this->manager->createQueryBuilder('a')
    //         ->select('a.numero')
    //         ->from(Address::class, 'a')
    //         ->Where('a.provincia = :province AND a.municipio AND a.calle = :street AND a.tipovia = :typeRoad')
    //         ->setParameter('province', $province)
    //         ->setParameter('township', $township)
    //         ->setParameter('street', $street)
    //         ->setParameter('typeRoad', $typeRoad);

    //     if ($cp !== null) {
    //         $qb = $qb
    //             ->andWhere('a.cp = :cp')
    //             ->setParameter('cp', $cp);
    //     }

    //     return $qb
    //         ->orderBy('a.cp', 'ASC')
    //         ->distinct()
    //         ->getQuery()
    //         ->getResult();
    // }