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

    public function suggestAddress($addressText)
    {
        $words = $this->getWords($addressText);
        // $wordsSortColumns = ['CALLE', 'PROVINCIA', 'MUNICIPIO', 'TIPOVIA'];
        $dbAddressData = $this->findAll();
        $addressCombinationsArray = $this->getAddressCombinations($this->getWordsOrderCombinations(/* $wordsSortColumns */), $this->getWordsLenghtCombinations($words, $dbAddressData /* ,$wordsSortColumns */));
        return $this->getSuggestedAddress($addressCombinationsArray, $words, $dbAddressData);
    }

    private function getWords($text)
    {
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

    private function getWordsOrderCombinations()
    {
        $wordsSort = ['street', 'province', 'municipality', 'typeRoad'];
        foreach ($wordsSort as $frist) {
            foreach ($wordsSort as $second) {
                foreach ($wordsSort as $third) {
                    foreach ($wordsSort as $key => $fourth) {
                        if ($frist !== $second && $frist !== $third && $frist !== $fourth && $second !== $third && $second !== $fourth && $third !== $fourth) {
                            $wordsOrder[] = [$frist => null, $second => null, $third => null, $fourth => null];
                        }
                    }
                }
            }
        }
        return $wordsOrder;
    }

    private function getWordsLenghtCombinations($words, $addressData/* , $wordsSortColumns */)
    {
        $maxWords = $this->getMaxWordsNumber($addressData, count($words));

        for ($wordsStreet = $maxWords['street']; $wordsStreet >= 0; $wordsStreet--) {
            for ($wordsProvince = $maxWords['province']; $wordsProvince >= 0; $wordsProvince--) {
                for ($wordsMunicipality = $maxWords['municipality']; $wordsMunicipality >= 0; $wordsMunicipality--) {
                    for ($wordsTypeRoad = $maxWords['typeRoad']; $wordsTypeRoad  >= 0; $wordsTypeRoad--) {
                        $sum = $wordsStreet + $wordsProvince + $wordsMunicipality + $wordsTypeRoad;
                        if (count($words) === $sum) {
                            $wordsLenght[] = ['street' => $wordsStreet, 'province' => $wordsProvince, 'municipality' => $wordsMunicipality, 'typeRoad' => $wordsTypeRoad];
                        }
                    }
                }
            }
        }
        return $wordsLenght;
    }

    private function getMaxWordsNumber($data, $maxValue)
    {
        $maxWords = [
            'province' => 0,
            'municipality' => 0,
            'typeRoad' => 0,
            'street' => 0
        ];

        foreach ($data as $address) {
            $maxWords['province'] = $this->getWords($address->getProvincia()) > $maxWords['province'] ? ($this->getWords($address->getProvincia()) <= $maxValue ? $this->getWords($address->getProvincia()) : $maxValue) : $maxWords['province'];
            $maxWords['municipality'] = $this->getWords($address->getMunicipio()) > $maxWords['municipality'] ? ($this->getWords($address->getMunicipio()) <= $maxValue ? $this->getWords($address->getMunicipio()) : $maxValue) : $maxWords['municipality'];
            $maxWords['typeRoad'] = $this->getWords($address->getTipovia()) > $maxWords['typeRoad'] ? ($this->getWords($address->getTipovia()) <= $maxValue ? $this->getWords($address->getTipovia()) : $maxValue) : $maxWords['typeRoad'];
            $maxWords['street'] = $this->getWords($address->getCalle()) > $maxWords['street'] ? ($this->getWords($address->getCalle()) <= $maxValue ? $this->getWords($address->getCalle()) : $maxValue) : $maxWords['street'];
        }

        return $maxWords;
    }

    private function getAddressCombinations($wordsOrderArray, $wordsLenghtArray)
    {
        foreach ($wordsOrderArray as $orderArray) {
            foreach ($wordsLenghtArray as $lenghtArray) {
                $aux = $orderArray;
                foreach ($aux as $key => $valueOrder) {
                    $aux[$key] = $lenghtArray[$key];
                }
                $combinations[] = $aux;
            }
        }
        return $combinations;
    }

    private function getSuggestedAddress($combinations, $words, $dbAddressData)
    {
        foreach ($combinations as $combination) {
            $aux = $combination;
            $sugestedAddress = [];
            $index = 0;
            foreach ($aux as $key => $value) {
                $text = '';
                for ($i = $index; $i < $value + $index; $i++) {
                    $text .= $words[$index];
                    $text .= $index < ($value + $index - 1) ? ' ' : '';
                }
                $index = $i;
                $aux[$key] = $text;
                $sugestedAddress[] = $aux;
            }

            foreach ($sugestedAddress as $sugestedValue) {
                foreach ($dbAddressData as $dbValue) {
                    // echo("provincia => ".$sugestedValue['province']." municipio => ".$sugestedValue['municipality']." tipoVia => ".$sugestedValue['typeRoad']." calle => ".$sugestedValue['street']."\n\t");
                    if (str_contains($dbValue->getProvincia(), $sugestedValue['province']) && str_contains($dbValue->getMunicipio(), $sugestedValue['municipality']) && str_contains($dbValue->getTipovia(), $sugestedValue['typeRoad']) && str_contains($dbValue->getCalle(), $sugestedValue['street'])) {
                        $data[] = [$dbValue->getTipovia(), $dbValue->getCalle(), $dbValue->getMunicipio(), $dbValue->getProvincia()];
                    }
                }
            }
        }
        return !empty($data) ? $data : [];
    }

    /* private function getSuggestedAddress($words = [], $addressData)
    {
        if (!empty($words)) {
            $wordsToSort = ['street', 'province', 'municipality', 'typeRoad'];

            foreach ($wordsToSort as $frist) {
                foreach ($wordsToSort as $second) {
                    foreach ($wordsToSort as $third) {
                        foreach ($wordsToSort as $fourth) {
                            if ($frist !== $second && $frist !== $third && $frist !== $fourth && $second !== $third && $second !== $fourth && $third !== $fourth) {
                                $wordsOrder[] = [$frist => null, $second => null, $third => null, $fourth => null];
                            }
                        }
                    }
                }
            }
            echo $wordsOrder; 

            $maxWords = $this->getMaxWordsNumber($addressData, count($words));
             for ($wordsStreet = $maxWords['street']; $wordsStreet >= 0; $wordsStreet--) {
                for ($wordsProvince = $maxWords['province']; $wordsProvince >= 0; $wordsProvince--) {
                    for ($wordsMunicipality = $maxWords['municipality']; $wordsMunicipality >= 0; $wordsMunicipality--) {
                        for ($wordsTypeRoad = $maxWords['typeRoad']; $wordsTypeRoad  >= 0; $wordsTypeRoad--) {
                            $sum = $wordsStreet + $wordsProvince + $wordsMunicipality + $wordsTypeRoad;
                            if (count($words) === $sum) {
                                $wordsLenght[] = ['street' => $wordsStreet, 'province' => $wordsProvince, 'municipality' => $wordsMunicipality, 'typeRoad' => $wordsTypeRoad];
                            }
                        }
                    }
                }
            }

            foreach ($wordsOrder as $orderArray) {
                foreach ($wordsLenght as $lenghtArray) {
                    $aux = $orderArray;
                    foreach ($aux as $key => $valueOrder) {
                        $valueOrder = $lenghtArray[$key];
                        //si no funciona cambiar linea arriba
                    }
                    $combinations[] = $aux;
                }
            }

            foreach ($combinations as $combination) {
                $index = 0;
                $aux = $combination;
                $address = [];
                foreach ($aux as $key => $value) {
                    $text = '';
                    for ($index; $index < $value + $index; $index++) {
                        $text += $words[$index];
                        $text += $index < ($value + $index - 1) ? ' ' : '';
                    }
                    $value = $text;
                    $address[] = $aux;
                }
                foreach ($address as $key => $value) {
                    if (str_contains($addressData['PROVINCIA'], $value['province']) && str_contains($addressData['MUNICIPIO'], $value['municipality']) && str_contains($addressData['TIPOVIA'], $value['typeRoad']) && str_contains($addressData['CALLE'], $value['street'])) {
                        $data[] = [$addressData['TIPOVIA'], $addressData['CALLE'], $addressData['MUNICIPIO'], $addressData['PROVINCIA']];
                    }
                }
            }
        } else {
            $data = [];
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
            ->select('a.PROVINCIA, a.MUNICIPIO, a.TIPOVIA, a.CALLE')
            ->andWhere('a.PROVINCIA like %:prov')
            ->andWhere('a.MUNICIPIO like %:mun')
            ->andWhere('a.TIPOVIA like %:typ')
            ->andWhere('a.CALLE like %:street')
            ->setParameter('prov', $province)
            ->setParameter('mun', $municipality)
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
