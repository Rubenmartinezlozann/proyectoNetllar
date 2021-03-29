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

    public function suggestAddress($addressText, $cp = null)
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

                    if (!$duplicated /* && count($data) < 6 */) {
                        $data[] = $nextValue;
                    }
                }
                $lastValue = [$dbValue->getTipovia(), $dbValue->getCalle(), $dbValue->getMunicipio(), $dbValue->getProvincia()];
            }
        }
        return $data;
    }

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
            ->select('a.PROVINCIA, a.MUNICIPIO, a.TIPOVIA, a.CALLE')
            ->andWhere('a.PROVINCIA like %:prov')
            ->andWhere('a.MUNICIPIO like %:mun')
            ->andWhere('a.TIPOVIA like %:typ')
            ->andWhere('a.CALLE like %:street')
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
